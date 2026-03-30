// client/src/services/certificateApi.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_BASE = '/api/certificates';

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

// ============================================
// ADMIN: Template CRUD
// ============================================

export function useTemplates() {
    return useQuery({
        queryKey: ['certificate-templates'],
        queryFn: async () => {
            const res = await fetch(`${API_BASE}/admin/templates`, { headers: getAuthHeaders() });
            if (!res.ok) throw new Error('Failed to fetch templates');
            const data = await res.json();
            return data.templates;
        },
    });
}

export function useCreateTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: { name: string; backgroundImage?: string; fields: any[]; isDefault?: boolean }) => {
            const res = await fetch(`${API_BASE}/admin/templates`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error('Failed to create template');
            return res.json();
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['certificate-templates'] }),
    });
}

export function useUpdateTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...body }: { id: number; name?: string; backgroundImage?: string; fields?: any[]; isDefault?: boolean }) => {
            const res = await fetch(`${API_BASE}/admin/templates/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error('Failed to update template');
            return res.json();
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['certificate-templates'] }),
    });
}

export function useDeleteTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(`${API_BASE}/admin/templates/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });
            if (!res.ok) throw new Error('Failed to delete template');
            return res.json();
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['certificate-templates'] }),
    });
}

export function useSetDefaultTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(`${API_BASE}/admin/templates/${id}/default`, {
                method: 'PUT',
                headers: getAuthHeaders(),
            });
            if (!res.ok) throw new Error('Failed to set default template');
            return res.json();
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['certificate-templates'] }),
    });
}

// ============================================
// ADMIN: All certificates
// ============================================

export function useAllCertificates() {
    return useQuery({
        queryKey: ['all-certificates'],
        queryFn: async () => {
            const res = await fetch(`${API_BASE}/admin/all`, { headers: getAuthHeaders() });
            if (!res.ok) throw new Error('Failed to fetch certificates');
            const data = await res.json();
            return data.certificates;
        },
    });
}

// ============================================
// USER: My certificates
// ============================================

export function useUserCertificates() {
    return useQuery({
        queryKey: ['my-certificates'],
        queryFn: async () => {
            const res = await fetch(`${API_BASE}/my`, { headers: getAuthHeaders() });
            if (!res.ok) throw new Error('Failed to fetch certificates');
            const data = await res.json();
            return data.certificates;
        },
    });
}

export function useCertificate(certId: string) {
    return useQuery({
        queryKey: ['certificate', certId],
        queryFn: async () => {
            const res = await fetch(`${API_BASE}/${certId}`, { headers: getAuthHeaders() });
            if (!res.ok) throw new Error('Failed to fetch certificate');
            const data = await res.json();
            return data.certificate;
        },
        enabled: !!certId,
    });
}

export async function downloadCertificatePDF(certId: string) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/${certId}/download`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Failed to download certificate');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${certId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}
