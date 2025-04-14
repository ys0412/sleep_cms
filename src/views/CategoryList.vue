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
            <el-table :data="categories" border>
                <el-table-column prop="id" label="ID" width="50" />
                <el-table-column prop="categoryName" label="分类名称" />
                <el-table-column prop="createdAt" label="创建时间" />
                <el-table-column prop="updatedAt" label="更新时间" />
                <el-table-column label="操作" width="180">
                    <template #default="{ row }">
                        <el-button type="primary" size="small" @click="openDialog(row)">编辑</el-button>
                        <el-button type="danger" size="small" @click="deleteAudio(row.id)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <el-dialog v-model="dialogVisible" title="编辑分类" width="500px">
                <el-form :model="audio" label-width="80px">
                    <el-form-item label="分类名称">
                        <el-input v-model="category.categoryName" placeholder="请输入分类名称" />
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
const BASE_URL = process.env.VUE_APP_API_BASE_URL;

export default {
    components: { Plus },
    setup() {
        const categories = ref([]);
        const category = ref({
            id: null,
            categoryName: "",
        });
        const dialogVisible = ref(false);


        const loadCategory = async () => {
            try {
                const res = await axios.get(BASE_URL + "/category");
                categories.value = res.data;
            } catch (error) {
                console.error("加载分类失败:", error);
            }
        };

        const openDialog = (row = null) => {
            if (row) {
                category.value = { ...row };
            } else {
                category.value = { id: null, categoryName: "" };
            }
            dialogVisible.value = true;
        };

        const saveCategory = async () => {
            try {
                let updatedCategory = category;
                // 3. 根据是否有 id 选择 PUT（更新）还是 POST（新增）
                if (updatedCategory.value.id) {
                    // await axios.put(`/category/${audio.value.id}`, updatedCategory); 
                    await axios.put(BASE_URL + `/category`, updatedCategory);
                } else {
                    await axios.post(BASE_URL + "/category", updatedCategory);
                }

                // 4. 关闭弹窗并刷新列表
                dialogVisible.value = false;
                loadCategory();
            } catch (error) {
                console.error("保存音频失败:", error);
            }
        };

        const deleteCategory = async (id) => {
            try {
                await axios.delete(BASE_URL + `/category/${id}`);
                loadCategory();
            } catch (error) {
                console.error("删除失败:", error);
            }
        };

        onMounted(loadCategory);

        return { categories, category, dialogVisible, openDialog, saveCategory, deleteCategory };
    },
};
</script>

<style>
.container {
    display: flex;
    flex-direction: column;
}
</style>
