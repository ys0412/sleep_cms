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
                    <template #default="{ row }">
                        <el-link type="primary" @click="goToAudioDetail(row.id)">{{ row.title }}</el-link>
                    </template>
                </el-table-column>
                <el-table-column prop="description" label="描述" />
                <el-table-column prop="category" label="分类" />
                <el-table-column prop="duration" label="时长" width="80" />
                <el-table-column prop="playCount" label="播放次数" width="100" />
                <el-table-column label="封面" width="100">
                    <template #default="{ row }">
                        <el-image v-if="row.coverUrl" :src="(row.coverUrl)" style="width: 50px; height: 50px"
                            fit="cover" />
                    </template>
                </el-table-column>
                <el-table-column label="MP3" prop="mp3Url">
                    <template #default="{ row }">
                        <el-button v-if="row.mp3Url" size="mini" @click="previewMp3File(row.mp3Url)">
                            预览MP3
                        </el-button>
                        <span v-else>暂无文件</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180">
                    <template #default="{ row }">
                        <el-button type="primary" size="small" @click="openDialog(row)">编辑</el-button>
                        <el-button type="danger" size="small" @click="deleteAudio(row.id)">删除</el-button>
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
                            <el-image v-if="audio.coverUrl" :src="(audio.coverUrl)" style="width: 100px; height: 100px"
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
                            <audio controls :src="audio.mp3Url" />
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
            duration: 0,
            category: "",
            playCount: 0
        });
        const dialogVisible = ref(false);
        const selectedImgFile = ref(null);
        const selectedMp3File = ref(null);


        const loadAudios = async () => {
            try {
                const res = await axios.get("/audio/list");
                audios.value = res.data;
            } catch (error) {
                console.error("加载音频失败:", error);
            }
        };

        const openDialog = (row = null) => {
            if (row) {
                audio.value = { ...row };
                if (row.coverUrl) {
                    audio.value.coverUrl = `${row.coverUrl}`;
                }
            } else {
                audio.value = { id: null, title: "", description: "", mp3Url: "", coverUrl: "", duration: 0, category: "", playCount: 0 };
            }
            dialogVisible.value = true;
        };

        const saveAudio = async () => {
            try {
                let coverUrl = audio.value.coverUrl;

                // 1. 如果有选中的文件，先上传封面
                if (selectedImgFile.value) {
                    const formData = new FormData();
                    formData.append("file", selectedImgFile.value);
                    if (audio.value.id) formData.append("id", audio.value.id);

                    const res = await axios.post(BASE_URL + "/upload/audioCover", formData);
                    coverUrl = res.data.url;
                }
                let updatedAudio = { ...audio.value, coverUrl };

                let mp3Url = audio.value.mp3Url;  // 使用 let 而不是 const
                if (selectedMp3File.value) {
                    const formData = new FormData();
                    formData.append("file", selectedMp3File.value);

                    if (audio.value.id) {
                        formData.append("id", audio.value.id);
                    }

                    const res = await axios.post(BASE_URL + "/upload/mp3", formData, {
                        headers: { "Content-Type": "multipart/form-data" }
                    });

                    mp3Url = res.data.url;  // 这里应该更新为上传后的URL
                }
                updatedAudio = { ...updatedAudio, mp3Url };  // 只更新 mp3Url，不覆盖 coverUrl
                // 3. 根据是否有 id 选择 PUT（更新）还是 POST（新增）
                if (audio.value.id) {
                    await axios.put(`/audio/update/${audio.value.id}`, updatedAudio); // 这里 audio.value 改成 updatedAudio
                } else {
                    await axios.post("/audio/add", updatedAudio);
                }

                // 4. 关闭弹窗并刷新列表
                dialogVisible.value = false;
                loadAudios();
            } catch (error) {
                console.error("保存音频失败:", error);
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


        const handleImgFileChange = (file) => {
            if (!file.raw) return;
            selectedImgFile.value = file.raw;
            audio.value.coverUrl = URL.createObjectURL(file.raw);  // 临时预览文件
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
            console.log(" file.type" + file.type);
            const isMp3 = file.type === 'audio/mp3' || file.type === 'audio/mpeg'; // 允许 'audio/mpeg'
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
        // 处理MP3选择
        const handleMp3Change = (file) => {
            if (!file.raw) return;
            selectedMp3File.value = file.raw;
            // 只在新增或更换MP3时才更新 mp3Url
            audio.value.mp3Url = URL.createObjectURL(file.raw);
            console.log("更新MP3 URL:", audio.value.mp3Url);
        };
        // 预览MP3文件
        const previewMp3File = () => {
            if (audio.value.mp3Url) {
                window.open(audio.value.mp3Url, '_blank');
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
