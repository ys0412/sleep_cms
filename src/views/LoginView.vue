<template>
    <div class="login-container">
        <div class="login-box">
            <h2>用户登录</h2>
            <form @submit.prevent="handleSubmit">
                <div class="form-group">
                    <label>用户名</label>
                    <input type="text" v-model="form.username" placeholder="请输入用户名" @input="validateUsername" />
                    <div v-if="usernameError" class="error-msg">{{ usernameError }}</div>
                </div>

                <div class="form-group">
                    <label>密码</label>
                    <input type="password" v-model="form.password" placeholder="请输入密码" @input="validatePassword" />
                    <div v-if="passwordError" class="error-msg">{{ passwordError }}</div>
                </div>

                <button type="submit" class="login-btn">登录</button>
            </form>
        </div>
    </div>
</template>

<script>
import axios from "axios";
export default {
    data() {
        return {
            form: {
                username: '',
                password: ''
            },
            usernameError: '',
            passwordError: ''
        }
    },
    methods: {
        validateUsername() {
            if (!this.form.username.trim()) {
                this.usernameError = '用户名不能为空'
            } else {
                this.usernameError = ''
            }
        },
        validatePassword() {
            if (!this.form.password) {
                this.passwordError = '密码不能为空'
            } else if (this.form.password.length < 4) {
                this.passwordError = '密码长度不能小于4位'
            } else {
                this.passwordError = ''
            }
        },
        async handleSubmit() {
            this.validateUsername()
            this.validatePassword()

            if (!this.usernameError && !this.passwordError) {
                try {
                    const response = await axios.post('/login/cmsLogin', this.form)

                    const token = response.data.token
                    if (token) {
                        // 保存 token 到 localStorage 或 sessionStorage
                        localStorage.setItem('jwtToken', token)

                        // 设置默认请求头（可选：也可以通过 axios 拦截器做）
                        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

                        // 跳转到主页
                        this.$router.push('/dash')
                    } else {
                        this.passwordError = '登录失败：未返回 token'
                    }
                } catch (error) {
                    console.error('登录失败:', error)
                    if (error.response && error.response.status === 401) {
                        this.passwordError = '用户名或密码错误'
                    } else {
                        this.passwordError = '服务器异常，请稍后再试'
                    }
                }
            }
        }
    }
}
</script>

<style scoped>
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f0f2f5;
}

.login-box {
    background: white;
    padding: 2rem 3rem;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    width: 400px;
}

h2 {
    text-align: center;
    color: #333;
    margin-bottom: 1.5rem;
}

.form-group {
    margin-bottom: 1.5rem;
}

label {
    display: block;
    margin-bottom: 0.5rem;
    color: #666;
}

input {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
}

input:focus {
    outline: none;
    border-color: #409eff;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.error-msg {
    color: #f56c6c;
    font-size: 0.9rem;
    margin-top: 0.3rem;
}

.login-btn {
    width: 100%;
    padding: 0.8rem;
    background-color: #409eff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.3s;
}

.login-btn:hover {
    background-color: #66b1ff;
}

.login-btn:active {
    background-color: #3375b9;
}
</style>