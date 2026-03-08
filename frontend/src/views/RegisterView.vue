<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authApi } from '../api';

const router = useRouter();
const name = ref('');
const email = ref('');
const password = ref('');
const role = ref('employee');
const error = ref('');
const loading = ref(false);

async function onSubmit() {
  error.value = '';
  if (!name.value || !email.value || !password.value) {
    error.value = 'Name, email and password are required.';
    return;
  }
  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters.';
    return;
  }
  loading.value = true;
  try {
    const { token, user } = await authApi.register({
      name: name.value,
      email: email.value,
      password: password.value,
      role: role.value,
    });
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    router.push({ name: 'Dashboard' });
  } catch (e) {
    error.value = e.message || 'Registration failed.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="w-full max-w-md bg-white rounded-lg shadow p-6">
      <h1 class="text-2xl font-bold mb-4">Register</h1>
      <form @submit.prevent="onSubmit" class="space-y-4">
        <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            v-model="name"
            type="text"
            required
            class="w-full border rounded px-3 py-2"
            placeholder="John Doe"
          />
        </div>
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
          <label class="block text-sm font-medium text-gray-700 mb-1">Password (min 6 chars)</label>
          <input
            v-model="password"
            type="password"
            required
            minlength="6"
            class="w-full border rounded px-3 py-2"
            placeholder="••••••••"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select v-model="role" class="w-full border rounded px-3 py-2">
            <option value="employee">Employee</option>
            <option value="employer">Employer</option>
          </select>
        </div>
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {{ loading ? 'Creating account...' : 'Register' }}
        </button>
      </form>
      <p class="mt-4 text-sm text-gray-600">
        Already have an account? <router-link to="/login" class="text-blue-600">Log In</router-link>
      </p>
    </div>
  </div>
</template>
