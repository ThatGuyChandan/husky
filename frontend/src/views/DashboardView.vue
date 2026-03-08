<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { leaveApi } from '../api';

const router = useRouter();
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'));
const leaves = ref([]);
const loading = ref(true);
const error = ref('');

// Apply form (employee)
const showForm = ref(false);
const leaveType = ref('');
const startDate = ref('');
const endDate = ref('');
const reason = ref('');
const formError = ref('');
const formLoading = ref(false);

async function loadLeaves() {
  try {
    leaves.value = await leaveApi.list();
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  if (!localStorage.getItem('token')) {
    router.push('/login');
    return;
  }
  loadLeaves();
});

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push('/login');
}

async function submitLeave() {
  formError.value = '';
  if (!leaveType.value || !startDate.value || !endDate.value || !reason.value) {
    formError.value = 'All fields are required.';
    return;
  }
  if (new Date(endDate.value) < new Date(startDate.value)) {
    formError.value = 'End date must be on or after start date.';
    return;
  }
  formLoading.value = true;
  try {
    await leaveApi.create({
      leaveType: leaveType.value,
      startDate: startDate.value,
      endDate: endDate.value,
      reason: reason.value,
    });
    showForm.value = false;
    leaveType.value = '';
    startDate.value = '';
    endDate.value = '';
    reason.value = '';
    loadLeaves();
  } catch (e) {
    formError.value = e.message;
  } finally {
    formLoading.value = false;
  }
}

async function approve(id) {
  try {
    await leaveApi.approve(id);
    loadLeaves();
  } catch (e) {
    error.value = e.message;
  }
}

async function reject(id) {
  try {
    await leaveApi.reject(id);
    loadLeaves();
  } catch (e) {
    error.value = e.message;
  }
}

function statusClass(s) {
  if (s === 'approved') return 'bg-green-100 text-green-800';
  if (s === 'rejected') return 'bg-red-100 text-red-800';
  return 'bg-yellow-100 text-yellow-800';
}

const leaveTypes = ['Sick', 'Annual', 'Personal', 'Unpaid', 'Other'];
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow">
      <div class="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
        <h1 class="text-lg font-semibold">Leave Management</h1>
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-600">{{ user.name }} ({{ user.role }})</span>
          <button
            @click="logout"
            class="text-sm text-red-600 hover:underline"
          >Logout</button>
        </div>
      </div>
    </nav>

    <main class="max-w-4xl mx-auto px-4 py-6">
      <p v-if="error" class="mb-4 text-red-600 text-sm">{{ error }}</p>

      <div v-if="user.role === 'employee'" class="mb-6">
        <button
          v-if="!showForm"
          @click="showForm = true"
          class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Apply for Leave
        </button>
        <div v-else class="bg-white rounded shadow p-4 space-y-4">
          <h2 class="font-semibold">Apply for Leave</h2>
          <p v-if="formError" class="text-red-600 text-sm">{{ formError }}</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm text-gray-700 mb-1">Leave Type</label>
              <select v-model="leaveType" class="w-full border rounded px-3 py-2" required>
                <option value="">Select...</option>
                <option v-for="t in leaveTypes" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm text-gray-700 mb-1">Start Date</label>
              <input v-model="startDate" type="date" class="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label class="block text-sm text-gray-700 mb-1">End Date</label>
              <input v-model="endDate" type="date" class="w-full border rounded px-3 py-2" required />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm text-gray-700 mb-1">Reason</label>
              <textarea
                v-model="reason"
                rows="3"
                class="w-full border rounded px-3 py-2"
                placeholder="Reason for leave"
                required
              />
            </div>
          </div>
          <div class="flex gap-2">
            <button
              @click="submitLeave"
              :disabled="formLoading"
              class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {{ formLoading ? 'Submitting...' : 'Submit' }}
            </button>
            <button
              @click="showForm = false"
              class="border px-4 py-2 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <h2 class="text-lg font-semibold mb-4">
        {{ user.role === 'employee' ? 'My Leave Requests' : 'All Leave Requests' }}
      </h2>
      <div v-if="loading" class="text-gray-600">Loading...</div>
      <div v-else-if="leaves.length === 0" class="text-gray-600">No leave requests.</div>
      <div v-else class="space-y-4">
        <div
          v-for="l in leaves"
          :key="l._id"
          class="bg-white rounded shadow p-4 flex flex-wrap justify-between items-start gap-4"
        >
          <div class="flex-1 min-w-0">
            <div v-if="user.role === 'employer'" class="text-sm text-gray-600 mb-1">
              Employee: {{ l.employee?.name || 'N/A' }} ({{ l.employee?.email || '' }})
            </div>
            <p><span class="font-medium">{{ l.leaveType }}</span> — {{ l.reason }}</p>
            <p class="text-sm text-gray-600 mt-1">
              {{ new Date(l.startDate).toLocaleDateString() }} to {{ new Date(l.endDate).toLocaleDateString() }}
            </p>
            <span
              :class="['inline-block mt-2 px-2 py-1 rounded text-xs font-medium', statusClass(l.status)]"
            >
              {{ l.status }}
            </span>
          </div>
          <div v-if="user.role === 'employer' && l.status === 'pending'" class="flex gap-2">
            <button
              @click="approve(l._id)"
              class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
            >
              Approve
            </button>
            <button
              @click="reject(l._id)"
              class="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
