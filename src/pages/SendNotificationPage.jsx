import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import notificationApi from '../api/notificationApi';
import { staffApiService } from '../api/staffApi';

const ROLE_OPTIONS = [
    { value: 'root_admin', label: 'Root Admin' },
    { value: 'manager', label: 'Admin' },
    { value: 'doctor', label: 'Doctor' },
    { value: 'nurse', label: 'Nurse' },
    { value: 'lab_technician', label: 'Lab Technician' },
    { value: 'receptionist', label: 'Receptionist' },
    { value: 'user', label: 'User' },
];

const TARGET_MODE_OPTIONS = [
    { value: 'all_users', label: 'All Users' },
    { value: 'all_users_include_me', label: 'All Users Including Me' },
    { value: 'role', label: 'Specific User Type' },
    { value: 'user', label: 'Specific User' },
];

const TAB_OPTIONS = [
    { value: 'compose', label: 'Compose' },
    { value: 'history', label: 'Sent History' },
];

const SendNotificationPage = ({ role }) => {
    const [staffMembers, setStaffMembers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [historyItems, setHistoryItems] = useState([]);
    const [activeTab, setActiveTab] = useState('compose');
    const [historyFilter, setHistoryFilter] = useState('all');
    const [form, setForm] = useState({
        title: '',
        message: '',
        notification_type: 'info',
        severity: 'low',
        target_mode: 'all_users',
        target_role: '',
        target_user_id: '',
    });

    const canAccess = role === 'root_admin' || role === 'manager';

    useEffect(() => {
        if (!canAccess) return;

        const loadUsers = async () => {
            try {
                setLoadingUsers(true);
                const response = await staffApiService.getAllStaff();
                setStaffMembers(response.data?.users || []);
            } catch (error) {
                console.error('Failed to load users for notifications:', error);
                toast.error('Failed to load users');
            } finally {
                setLoadingUsers(false);
            }
        };

        loadUsers();
    }, [canAccess]);

    const loadAdminHistory = async () => {
        try {
            setHistoryLoading(true);
            const data = await notificationApi.getAdminNotificationHistory();
            setHistoryItems(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load admin notification history:', error);
            toast.error('Failed to load sent notification history');
        } finally {
            setHistoryLoading(false);
        }
    };

    useEffect(() => {
        if (!canAccess) return;
        loadAdminHistory();
    }, [canAccess]);

    const filteredUsers = useMemo(() => {
        if (form.target_mode !== 'role' || !form.target_role) return staffMembers;
        return staffMembers.filter((user) => user.role === form.target_role);
    }, [form.target_mode, form.target_role, staffMembers]);

    const filteredHistory = useMemo(() => {
        if (historyFilter === 'resolved') return historyItems.filter((item) => item.is_resolved);
        if (historyFilter === 'read') return historyItems.filter((item) => item.is_read && !item.is_resolved);
        if (historyFilter === 'unread') return historyItems.filter((item) => !item.is_read && !item.is_resolved);
        return historyItems;
    }, [historyFilter, historyItems]);

    const summary = useMemo(() => ({
        users: staffMembers.length,
        sent: historyItems.length,
        resolved: historyItems.filter((item) => item.is_resolved).length,
        unread: historyItems.filter((item) => !item.is_read && !item.is_resolved).length,
    }), [historyItems, staffMembers.length]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
            ...(name === 'target_mode' && value !== 'role' ? { target_role: '' } : {}),
            ...(name === 'target_mode' && value !== 'user' ? { target_user_id: '' } : {}),
            ...(name === 'target_role' ? { target_user_id: '' } : {}),
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!form.title.trim() || !form.message.trim()) {
            toast.error('Title and message are required');
            return;
        }
        if (form.target_mode === 'role' && !form.target_role) {
            toast.error('Please select a user type');
            return;
        }
        if (form.target_mode === 'user' && !form.target_user_id) {
            toast.error('Please select a user');
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                ...form,
                title: form.title.trim(),
                message: form.message.trim(),
                target_user_id: form.target_user_id || null,
                target_role: form.target_role || null,
            };
            const response = await notificationApi.sendCustomNotification(payload);
            toast.success(`Sent ${response.count} notification${response.count !== 1 ? 's' : ''}`);
            setForm({
                title: '',
                message: '',
                notification_type: 'info',
                severity: 'low',
                target_mode: 'all_users',
                target_role: '',
                target_user_id: '',
            });
            setActiveTab('history');
            loadAdminHistory();
        } catch (error) {
            console.error('Failed to send custom notification:', error);
            toast.error(error.response?.data?.error || 'Failed to send notification');
        } finally {
            setSubmitting(false);
        }
    };

    const getSeverityClasses = (severity) => {
        if (severity === 'high') return 'bg-red-100 text-red-700 border-red-200';
        if (severity === 'med') return 'bg-amber-100 text-amber-700 border-amber-200';
        return 'bg-sky-100 text-sky-700 border-sky-200';
    };

    const formatDateTime = (value) => {
        if (!value) return '--';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '--';
        return date.toLocaleString([], {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getTargetSummary = () => {
        if (form.target_mode === 'role' && form.target_role) {
            const selectedRole = ROLE_OPTIONS.find((option) => option.value === form.target_role);
            return `Sending to all active ${selectedRole?.label || form.target_role} users`;
        }
        if (form.target_mode === 'user' && form.target_user_id) {
            const user = staffMembers.find((item) => String(item.id) === String(form.target_user_id));
            return user ? `Sending to ${user.name}` : 'Sending to selected user';
        }
        if (form.target_mode === 'all_users_include_me') return 'Sending to all active users including you';
        return 'Sending to all active users except you';
    };

    /* ── Access guard ── */
    if (!canAccess) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="mx-auto max-w-3xl border border-red-100 bg-white p-8 shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-900">Access Restricted</h2>
                    <p className="mt-3 text-gray-600">
                        Only admin and root admin users can send custom notifications.
                    </p>
                </div>
            </div>
        );
    }

    /* ── Main UI ── */
    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.12),_transparent_32%),linear-gradient(180deg,_#f8fbff_0%,_#eef4ff_100%)] p-4 md:p-8">
            <div className="mx-auto max-w-7xl">
                <div className="overflow-hidden border border-slate-200 bg-white/80 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">

                    {/* ── Header ── */}
                    <div className="border-b border-blue-900 bg-gradient-to-br from-blue-900 via-blue-800 to-teal-800 px-6 py-8 text-white md:px-8">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div className="max-w-2xl">
                                <p className="text-sm uppercase tracking-[0.28em] text-teal-300">
                                    Admin Notification Center
                                </p>
                                <h2 className="mt-3 text-3xl font-bold md:text-4xl">
                                    Send alerts and review user delivery history
                                </h2>
                                <p className="mt-3 text-sm leading-6 text-blue-200 md:text-base">
                                    Manage manual announcements from one place. Compose targeted notifications and
                                    inspect who received previous messages.
                                </p>
                            </div>

                            {/* ── Stats cards ── */}
                            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                                {[
                                    { label: 'Users', value: loadingUsers ? '--' : summary.users },
                                    { label: 'Sent', value: summary.sent },
                                    { label: 'Resolved', value: summary.resolved },
                                    { label: 'Unread', value: summary.unread },
                                ].map(({ label, value }) => (
                                    <div key={label} className="border border-white/10 bg-white/10 px-4 py-3">
                                        <p className="text-xs uppercase tracking-wide text-blue-200">{label}</p>
                                        <p className="mt-2 text-2xl font-semibold">{value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── Tabs ── */}
                    <div className="px-6 py-5 md:px-8">
                        <div className="inline-flex flex-wrap border border-slate-200 bg-slate-50 p-1">
                            {TAB_OPTIONS.map((tab) => (
                                <button
                                    key={tab.value}
                                    type="button"
                                    onClick={() => setActiveTab(tab.value)}
                                    className={`px-5 py-2.5 text-sm font-semibold transition ${activeTab === tab.value
                                        ? 'bg-white text-blue-700 shadow-sm'
                                        : 'text-slate-500 hover:text-blue-600'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Tab content ── */}
                    <div className="px-6 pb-8 md:px-8">

                        {/* ── Compose tab ── */}
                        {activeTab === 'compose' ? (
                            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">

                                {/* Form */}
                                <form
                                    onSubmit={handleSubmit}
                                    className="border border-slate-200 bg-white p-4 shadow-sm md:p-6"
                                >
                                    <div className="mb-6 flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="text-2xl font-bold text-slate-900">
                                                Compose New Notification
                                            </h3>
                                            <p className="mt-2 text-sm text-slate-500">{getTargetSummary()}</p>
                                        </div>
                                        <span className="bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700">
                                            Manual Send
                                        </span>
                                    </div>

                                    <div className="grid gap-5">
                                        {/* Title + Audience row */}
                                        <div className="grid gap-5 md:grid-cols-[1.15fr_0.85fr]">
                                            <div>
                                                <label
                                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                                    htmlFor="title"
                                                >
                                                    Title
                                                </label>
                                                <input
                                                    id="title"
                                                    name="title"
                                                    value={form.title}
                                                    onChange={handleChange}
                                                    placeholder="Example: ICU shift handoff alert"
                                                    className="w-full border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                                />
                                            </div>
                                            <div>
                                                <label
                                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                                    htmlFor="target_mode"
                                                >
                                                    Audience
                                                </label>
                                                <select
                                                    id="target_mode"
                                                    name="target_mode"
                                                    value={form.target_mode}
                                                    onChange={handleChange}
                                                    className="w-full border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                                >
                                                    {TARGET_MODE_OPTIONS.map((option) => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Message */}
                                        <div>
                                            <label
                                                className="mb-2 block text-sm font-semibold text-slate-700"
                                                htmlFor="message"
                                            >
                                                Message
                                            </label>
                                            <textarea
                                                id="message"
                                                name="message"
                                                rows="7"
                                                value={form.message}
                                                onChange={handleChange}
                                                placeholder="Write a clear, actionable message for the selected audience."
                                                className="w-full border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                            />
                                        </div>

                                        {/* Type + Severity row */}
                                        <div className="grid gap-5 md:grid-cols-2">
                                            <div>
                                                <label
                                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                                    htmlFor="notification_type"
                                                >
                                                    Type
                                                </label>
                                                <select
                                                    id="notification_type"
                                                    name="notification_type"
                                                    value={form.notification_type}
                                                    onChange={handleChange}
                                                    className="w-full border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                                >
                                                    <option value="info">Info</option>
                                                    <option value="warning">Warning</option>
                                                    <option value="error">Error</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label
                                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                                    htmlFor="severity"
                                                >
                                                    Severity
                                                </label>
                                                <select
                                                    id="severity"
                                                    name="severity"
                                                    value={form.severity}
                                                    onChange={handleChange}
                                                    className="w-full border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                                >
                                                    <option value="low">Low</option>
                                                    <option value="med">Medium</option>
                                                    <option value="high">High</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Conditional: role selector */}
                                        {form.target_mode === 'role' && (
                                            <div>
                                                <label
                                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                                    htmlFor="target_role"
                                                >
                                                    User Type
                                                </label>
                                                <select
                                                    id="target_role"
                                                    name="target_role"
                                                    value={form.target_role}
                                                    onChange={handleChange}
                                                    className="w-full border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                                >
                                                    <option value="">Select user type</option>
                                                    {ROLE_OPTIONS.map((option) => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        {/* Conditional: specific user selector */}
                                        {form.target_mode === 'user' && (
                                            <div>
                                                <label
                                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                                    htmlFor="target_user_id"
                                                >
                                                    Specific User
                                                </label>
                                                <select
                                                    id="target_user_id"
                                                    name="target_user_id"
                                                    value={form.target_user_id}
                                                    onChange={handleChange}
                                                    disabled={loadingUsers}
                                                    className="w-full border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                                                >
                                                    <option value="">Select user</option>
                                                    {filteredUsers.map((user) => (
                                                        <option key={user.id} value={user.id}>
                                                            {user.name} ({user.role})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        {/* Footer bar */}
                                        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 px-4 py-4">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">Delivery preview</p>
                                                <p className="mt-1 text-sm text-slate-500">{getTargetSummary()}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setForm({
                                                            title: '',
                                                            message: '',
                                                            notification_type: 'info',
                                                            severity: 'low',
                                                            target_mode: 'all_users',
                                                            target_role: '',
                                                            target_user_id: '',
                                                        })
                                                    }
                                                    className="border border-slate-300 px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-white"
                                                >
                                                    Reset
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={submitting}
                                                    className="bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                                                >
                                                    {submitting ? 'Sending...' : 'Send Notification'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>

                                {/* Sidebar */}
                                <div className="space-y-6">
                                    {/* Distribution snapshot */}
                                    <div className="border border-teal-100 bg-gradient-to-br from-teal-50 to-cyan-50 p-4 shadow-sm md:p-6">
                                        <h3 className="text-xl font-bold text-slate-900">Distribution Snapshot</h3>
                                        <p className="mt-2 text-sm text-slate-600">
                                            Review active user counts before you send.
                                        </p>
                                        <div className="mt-5 space-y-3">
                                            {ROLE_OPTIONS.map((roleOption) => {
                                                const count = staffMembers.filter(
                                                    (user) => user.role === roleOption.value
                                                ).length;
                                                return (
                                                    <div
                                                        key={roleOption.value}
                                                        className="flex items-center justify-between bg-white/80 px-4 py-3"
                                                    >
                                                        <span className="text-sm font-medium text-slate-700">
                                                            {roleOption.label}
                                                        </span>
                                                        <span className="bg-blue-700 px-2.5 py-1 text-xs font-semibold text-white">
                                                            {count}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Targeting rules */}
                                    <div className="border border-slate-200 bg-white p-4 shadow-sm md:p-6">
                                        <h3 className="text-xl font-bold text-slate-900">Targeting Rules</h3>
                                        <div className="mt-4 space-y-3 text-sm text-slate-600">
                                            <p>All Users excludes the sender.</p>
                                            <p>All Users Including Me includes the sender.</p>
                                            <p>Specific User Type sends to every active user in that role.</p>
                                            <p>Specific User sends to one active user only.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* ── History tab ── */
                            <div className="border border-slate-200 bg-white p-4 shadow-sm md:p-6">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-900">
                                            Sent Notification History
                                        </h3>
                                        <p className="mt-2 text-sm text-slate-500">
                                            Review notification delivery history for users from this admin workspace.
                                        </p>
                                    </div>

                                    {/* Filter buttons */}
                                    <div className="flex flex-wrap gap-2">
                                        {['all', 'unread', 'read', 'resolved'].map((option) => (
                                            <button
                                                key={option}
                                                type="button"
                                                onClick={() => setHistoryFilter(option)}
                                                className={`px-4 py-2 text-sm font-semibold transition ${historyFilter === option
                                                    ? 'bg-blue-700 text-white'
                                                    : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                                                    }`}
                                            >
                                                {option.charAt(0).toUpperCase() + option.slice(1)}
                                            </button>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={loadAdminHistory}
                                            className="border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                        >
                                            Refresh
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    {historyLoading ? (
                                        <div className="bg-slate-50 px-6 py-16 text-center text-slate-500">
                                            Loading sent notification history...
                                        </div>
                                    ) : filteredHistory.length === 0 ? (
                                        <div className="bg-slate-50 px-6 py-16 text-center text-slate-500">
                                            No sent notification history found for this filter.
                                        </div>
                                    ) : (
                                        <div className="grid gap-4">
                                            {filteredHistory.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="border border-slate-200 bg-[linear-gradient(180deg,_#ffffff,_#f0f9ff)] p-4 shadow-sm md:p-5"
                                                >
                                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                                        <div className="min-w-0 flex-1">
                                                            {/* Badges row */}
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <h4 className="text-lg font-bold text-slate-900">{item.title}</h4>
                                                                <span
                                                                    className={`border px-2.5 py-1 text-xs font-semibold uppercase ${getSeverityClasses(item.severity)}`}
                                                                >
                                                                    {item.severity}
                                                                </span>
                                                                <span className="bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase text-slate-600">
                                                                    {item.notification_type}
                                                                </span>
                                                                <span
                                                                    className={`px-2.5 py-1 text-xs font-semibold uppercase ${item.is_resolved
                                                                        ? 'bg-emerald-100 text-emerald-700'
                                                                        : item.is_read
                                                                            ? 'bg-slate-200 text-slate-700'
                                                                            : 'bg-amber-100 text-amber-700'
                                                                        }`}
                                                                >
                                                                    {item.is_resolved ? 'resolved' : item.is_read ? 'read' : 'pending'}
                                                                </span>
                                                            </div>

                                                            <p className="mt-3 text-sm leading-6 text-slate-600">{item.message}</p>

                                                            {/* Meta chips */}
                                                            <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
                                                                <span className="bg-slate-100 px-3 py-1">
                                                                    Recipient: {item.recipient_name || 'Global'}
                                                                </span>
                                                                <span className="bg-slate-100 px-3 py-1">
                                                                    Role: {item.recipient_role || item.target_role || item.delivery_scope}
                                                                </span>
                                                                <span className="bg-slate-100 px-3 py-1">
                                                                    Sent by: {item.created_by_name || 'System'}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Date / scope card */}
                                                        <div className="shrink-0 bg-gradient-to-br from-blue-800 to-teal-700 px-4 py-3 text-sm text-white">
                                                            <p className="text-xs uppercase tracking-wide text-blue-200">Created</p>
                                                            <p className="mt-2 font-semibold">{formatDateTime(item.created_at)}</p>
                                                            <p className="mt-3 text-xs uppercase tracking-wide text-blue-200">Scope</p>
                                                            <p className="mt-2 font-semibold">{item.delivery_scope || 'global'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SendNotificationPage;