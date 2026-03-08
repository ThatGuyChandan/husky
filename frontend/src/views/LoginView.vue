<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authApi } from '../api';

const router = useRouter();
const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

async function onSubmit() {
  error.value = '';
  if (!email.value || !password.value) {
    error.value = 'Email and password are required.';
    return;
  }
  loading.value = true;
  try {
    const { token, user } = await authApi.login({ email: email.value, password: password.value });
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    router.push({ name: 'Dashboard' });
  } catch (e) {
    error.value = e.message || 'Login failed.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="w-full max-w-md bg-white rounded-lg shadow p-6">
      <h1 class="text-2xl font-bold mb-4">Log In</h1>
      <form @submit.prevent="onSubmit" class="space-y-4">
        <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full border rounded px-3 py-2"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full border rounded px-3 py-2"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>
      <p class="mt-4 text-sm text-gray-600">
        Don't have an account? <router-link to="/register" class="text-blue-600">Register</router-link>
      </p>
    </div>
  </div>
</template>
