<template>
    <div class="container">
        <div class="button-view">
            <el-button type="primary" class="transparent-button" @click="openDialog"
                style="display: flex; align-items: center;">
                <el-icon style="margin-right: 1px;">
                    <Plus />
                </el-icon>
                <span style="margin-top: 2px;">新增</span>
            </el-button>
        </div>
        <div class="form-view">
            <el-table :data="audios" border>
                <el-table-column prop="id" label="ID" width="50" />
                <el-table-column prop="title" label="标题">
                </el-table-column>
                <el-table-column prop="description" label="描述" />
                <el-table-column prop="categoryId" label="分类" />
                <el-table-column prop="duration" label="时长" width="80" />
                <el-table-column prop="playCount" label="播放次数" width="100" />
                <el-table-column label="封面" width="100">
                    <template #default="{ row }">
                        <el-image v-if="row.coverUrl" :src="row.coverUrl" style="width: 50px; height: 50px"
                            fit="cover" />
                    </template>
                </el-table-column>
                <el-table-column label="MP3" prop="mp3Url">
                    <template #default="{ row }">
                        <el-button v-if="row.mp3Url" @click="previewMp3File(row.mp3Url)">
                            预览MP3
                        </el-button>
                        <span v-else>暂无文件</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180">
                    <template #default="{ row }">
                        <el-button type="primary" @click="openDialog(row)">编辑</el-button>
                        <el-button type="danger" @click="deleteAudio(row.id)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <el-dialog v-model="dialogVisible" title="编辑音频" width="500px">
                <el-form :model="audio" label-width="80px">
                    <el-form-item label="标题">
                        <el-input v-model="audio.title" placeholder="请输入标题" />
                    </el-form-item>
                    <el-form-item label="描述">
                        <el-input v-model="audio.description" placeholder="请输入描述" />
                    </el-form-item>
                    <el-form-item label="封面">
                        <el-upload class="avatar-uploader" :show-file-list="false" :auto-upload="false"
                            :before-upload="beforeUpload" :on-change="handleImgFileChange">
                            <el-image v-if="audio.coverUrl" :src="audio.coverUrl" style="width: 100px; height: 100px"
                                fit="cover" />
                            <el-button v-else type="primary">选择封面</el-button>
                        </el-upload>
                    </el-form-item>
                    <el-form-item label="MP3">
                        <el-upload class="upload-demo" drag action="" :before-upload="beforeMp3Upload"
                            :on-change="handleMp3Change" :auto-upload="false">
                            <template #trigger>
                                <el-button size="small" type="primary">点击上传MP3文件</el-button>
                            </template>
                            <template #tip>
                                只能上传MP3文件
                            </template>
                        </el-upload>
                        <div v-if="audio.mp3Url" style="margin-top: 10px;">
                            <audio v-if="audio.mp3Url" controls :src="audio.mp3Url" style="margin-top: 10px;" />
                        </div>
                    </el-form-item>
                    <el-form-item label="分类">
                        <el-input v-model="audio.category" placeholder="请输入分类" />
                    </el-form-item>
                </el-form>
                <div style="text-align: right">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="saveAudio">保存</el-button>
                </div>
            </el-dialog>
        </div>
    </div>
</template>

<script>
import axios from "axios";
import { ref, onMounted } from "vue";
import { Plus } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
// import { id } from "element-plus/es/locale";
const BASE_URL = process.env.VUE_APP_API_BASE_URL;

export default {
    components: { Plus },
    setup() {
        const audios = ref([]);
        const audio = ref({
            id: null,
            title: "",
            description: "",
            mp3Url: "",
            coverUrl: "",
            coverColor: "",
            duration: 0,
            category: "",
            playCount: 0
        });
        const dialogVisible = ref(false);
        const selectedImgFile = ref(null);
        const selectedMp3File = ref(null);
        const hasNewCover = ref(false);
        const hasNewMp3 = ref(false);
        const imgFile = ref(null);
        const mp3File = ref(null);

        const loadAudios = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/audio/list`);
                audios.value = await Promise.all(res.data.map(async (audio) => {
                    const newAudio = { ...audio };

                    if (newAudio.coverUrl) {
                        const imgUrl = `${BASE_URL}/api/media/image/${newAudio.coverUrl}`;
                        newAudio.coverUrl = await getFileWithToken(imgUrl);
                    }

                    if (newAudio.mp3Url) {
                        const mp3Url = `${BASE_URL}/api/media/mp3/${newAudio.mp3Url}`;
                        newAudio.mp3Url = await getFileWithToken(mp3Url);
                    }

                    return newAudio;
                }));
            } catch (error) {
                console.error("加载音频失败:", error);
            }
        };

        const openDialog = (row) => {
            if (row) {
                // 编辑时保留原始URL
                audio.value = { ...row };
                // 重置上传状态
                hasNewCover.value = false;
                hasNewMp3.value = false;
            } else {
                // 新增时重置状态
                audio.value = {
                    id: null,
                    title: "",
                    description: "",
                    mp3Url: "",
                    coverUrl: "",
                    categoryId: "",
                    duration: 0,
                    playCount: 0
                };
            }
            dialogVisible.value = true;
        };

        const saveAudio = async () => {
            try {
                let coverUrl = audio.value.coverUrl; // 默认使用当前封面 URL
                let mp3Url = audio.value.mp3Url;     // 默认使用当前 MP3 URL

                // 只有当用户选择了新封面时才上传
                if (hasNewCover.value && imgFile.value) {
                    const formData = new FormData();
                    formData.append("file", imgFile.value);
                    if (audio.value.id) {
                        formData.append("id", audio.value.id);
                    }
                    const res = await axios.post(
                        BASE_URL + "/upload/audioCover",
                        formData,
                        {
                            headers: { "Content-Type": "multipart/form-data" },
                        }
                    );
                    coverUrl = res.data.url;
                }

                // 只有当用户选择了新MP3时才上传
                if (hasNewMp3.value && mp3File.value) {
                    const formData = new FormData();
                    formData.append("file", mp3File.value);
                    if (audio.value.id) {
                        formData.append("id", audio.value.id);
                    }
                    const res = await axios.post(
                        BASE_URL + "/upload/mp3",
                        formData,
                        {
                            headers: { "Content-Type": "multipart/form-data" },
                        }
                    );
                    mp3Url = res.data.url;
                }

                // 构造提交数据
                const audioData = {
                    id: audio.value.id || null,
                    title: audio.value.title,
                    description: audio.value.description,
                    category: audio.value.category,
                    playCount: audio.value.playCount,
                    duration: audio.value.duration,
                };

                // 如果用户更新了封面才添加 coverUrl
                if (hasNewCover.value) {
                    audioData.coverUrl = coverUrl;
                }

                // 如果用户更新了 MP3 才添加 mp3Url
                if (hasNewMp3.value) {
                    audioData.mp3Url = mp3Url;
                }

                // 区分新增和更新
                if (audio.value.id) {
                    await axios.put(`${BASE_URL}/audio/update/${audio.value.id}`, audioData);
                } else {
                    await axios.post(`${BASE_URL}/audio/add`, audioData);
                }

                dialogVisible.value = false;
                selectedImgFile.value = null;
                selectedMp3File.value = null;
                hasNewCover.value = false;
                hasNewMp3.value = false;

                loadAudios();
                ElMessage.success("保存成功！");
            } catch (error) {
                console.error("保存音频失败:", error);
                ElMessage.error("保存失败！");
            }
        };


        const deleteAudio = async (id) => {
            try {
                await axios.delete(`/audio/delete/${id}`);
                loadAudios();
            } catch (error) {
                console.error("删除失败:", error);
            }
        };

        // 修改图片处理
        const handleImgFileChange = (uploadFile) => {
            const isImage = uploadFile.raw.type.startsWith('image/');
            if (!isImage) {
                ElMessage.error('只能上传图片文件');
                return;
            }
            hasNewCover.value = true;
            imgFile.value = uploadFile.raw;
            audio.value.coverUrl = URL.createObjectURL(uploadFile.raw);
        };

        const beforeUpload = (file) => {
            const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isJPG || !isLt2M) {
                ElMessage.error(isJPG ? '上传图片大小不能超过 2MB！' : '上传图片只能是 JPG/PNG 格式！');
                return false;
            }
            return true;
        };

        const beforeMp3Upload = (file) => {
            const isMp3 = file.type === 'audio/mp3' || file.type === 'audio/mpeg';
            const isLt10M = file.size / 1024 / 1024 < 10;

            if (!isMp3) {
                ElMessage.error('上传文件只能是 MP3 格式！');
                return false;
            }
            if (!isLt10M) {
                ElMessage.error('上传文件大小不能超过 10MB！');
                return false;
            }
            return true;
        };

        // 修改MP3处理
        const handleMp3Change = (uploadFile) => {
            const isAudio = uploadFile.raw.type.startsWith('audio/');
            if (!isAudio) {
                ElMessage.error('只能上传音频文件');
                return;
            }
            hasNewMp3.value = true;
            mp3File.value = uploadFile.raw;
            audio.value.mp3Url = URL.createObjectURL(uploadFile.raw);
        };

        const previewMp3File = () => {
            if (audio.value.mp3Url) {
                window.open(audio.value.mp3Url, '_blank');
            }
        };
        const getFileWithToken = async (url) => {
            try {
                const res = await axios.get(url, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("jwtToken")}` // 替换为你实际存储 token 的位置
                    },
                    responseType: 'blob'
                });
                return URL.createObjectURL(res.data);
            } catch (error) {
                console.error('获取文件失败：', error);
                return '';
            }
        };
        onMounted(loadAudios);

        return { audios, audio, dialogVisible, openDialog, saveAudio, deleteAudio, selectedImgFile, selectedMp3File, handleImgFileChange, beforeUpload, handleMp3Change, previewMp3File, beforeMp3Upload };
    },
};
</script>


<style>
.container {
    display: flex;
    flex-direction: column;
}
</style>
