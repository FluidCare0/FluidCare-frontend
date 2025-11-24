import React, { useState, useEffect } from 'react';

const NotificationSidebar = () => {
    // State for notifications and new notification IDs for animation
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            title: "IV Bottle Low",
            message: "Patient John Doe's IV bottle is at 15%",
            time: "2 minutes ago",
            type: "warning", // Could be mapped from severity if needed
            severity: "med", // New field based on WebSocket
            read: false,
            resolved: false // New field to track resolved status
        },
        {
            id: 2,
            title: "New Patient",
            message: "Patient Jane Smith has been admitted to Ward A",
            time: "10 minutes ago",
            type: "info",
            severity: "low",
            read: false,
            resolved: false
        },
        {
            id: 3,
            title: "Device Alert",
            message: "IV-001 device requires maintenance",
            time: "1 hour ago",
            type: "error",
            severity: "high", // Example of a high severity notification
            read: true,
            resolved: false
        },
        {
            id: 4,
            title: "System Update",
            message: "New software update available",
            time: "2 hours ago",
            type: "info",
            severity: "low",
            read: true,
            resolved: false
        }
    ]);
    const [newNotificationIds, setNewNotificationIds] = useState(new Set());

    // Function to determine icon based on type
    const getNotificationIcon = (type) => {
        switch (type) {
            case 'warning':
                return (
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                );
            case 'error':
                return (
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 11-16 0 8 8 0 0116 0zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                );
        }
    };

    // Function to determine background color based on severity
    const getSeverityBgColor = (severity) => {
        if (severity === "high") return "bg-red-50 border-l-4 border-red-500";
        if (severity === "med") return "bg-yellow-50 border-l-4 border-yellow-500";
        return "bg-white"; // Default for low or undefined
    };

    // Function to mark a notification as read
    const markAsRead = (id) => {
        setNotifications(prevNotifications =>
            prevNotifications.map(notif =>
                notif.id === id ? { ...notif, read: true } : notif
            )
        );
    };

    // Function to mark all notifications as read
    const markAllAsRead = () => {
        setNotifications(prevNotifications =>
            prevNotifications.map(notif => ({ ...notif, read: true }))
        );
    };

    // Function to resolve a high-severity notification
    const resolveNotification = (id) => {
        setNotifications(prevNotifications =>
            prevNotifications.map(notif =>
                notif.id === id ? { ...notif, resolved: true } : notif
            )
        );
    };

    // Function to add a new notification (simulates receiving from WebSocket)
    // In a real scenario, this would be called by a WebSocket listener
    const addNewNotification = (newNotif) => {
        setNotifications(prevNotifications => [newNotif, ...prevNotifications]);
        // Add the new ID to the temporary set for animation
        setNewNotificationIds(prev => new Set([...prev, newNotif.id]));
        // Remove the ID after animation duration (e.g., 2 seconds)
        setTimeout(() => {
            setNewNotificationIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(newNotif.id);
                return newSet;
            });
        }, 2000); // Animation duration
    };

    // Simulate receiving a new notification for demonstration
    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         const newNotif = {
    //             id: Date.now(), // Use a proper ID in real implementation
    //             title: "Simulated New Alert",
    //             message: "This is a simulated new notification.",
    //             time: "Just now",
    //             type: "info",
    //             severity: ["low", "med", "high"][Math.floor(Math.random() * 3)],
    //             read: false,
    //             resolved: false
    //         };
    //         addNewNotification(newNotif);
    //     }, 10000); // Add a new notification every 10 seconds
    //     return () => clearInterval(interval);
    // }, []);

    return (
        <div className="w-80 bg-white border-l border-gray-200 shadow-sm flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                    <button
                        onClick={markAllAsRead}
                        className="text-sm text-blue-600 hover:text-blue-800"
                    >
                        Mark all as read
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No notifications
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {notifications.map((notification) => {
                            // Check if this notification is new for animation
                            const isNew = newNotificationIds.has(notification.id);
                            // Check if it's high severity and not yet resolved
                            const isHighAndUnresolved = notification.severity === "high" && !notification.resolved;

                            return (
                                <div
                                    key={notification.id}
                                    // Apply base styles and conditional styles for new notifications and severity
                                    className={`p-4 border-l-4 border-transparent transition-all duration-200 ease-in-out ${!notification.read ? 'bg-blue-50' : getSeverityBgColor(notification.severity)
                                        } ${isNew ? 'bg-yellow-100 animate-pulse' : ''} ${notification.resolved ? 'opacity-60' : ''
                                        }`}
                                    // Mark as read on click (unless resolved)
                                    onClick={() => !notification.resolved && markAsRead(notification.id)}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0"> {/* Added min-w-0 for text truncation if needed */}
                                            <div className="flex items-center justify-between gap-2">
                                                <h4 className="font-medium text-gray-800 truncate">{notification.title}</h4>
                                                {/* Show resolved badge if resolved */}
                                                {notification.resolved && (
                                                    <span className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded-full">
                                                        Resolved
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                            <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                                        </div>
                                    </div>
                                    {/* Conditionally render the Resolve button for high-severity, unresolved, unread notifications */}
                                    {isHighAndUnresolved && !notification.read && (
                                        <div className="mt-2 flex justify-end">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Prevent parent click (mark as read)
                                                    resolveNotification(notification.id);
                                                }}
                                                className="text-xs px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                            >
                                                Resolve
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationSidebar;