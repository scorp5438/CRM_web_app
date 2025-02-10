useEffect(() => {
    if (user && user.is_staff) {
        fetchUserExams();
        const ws = new WebSocket(`ws://127.0.0.1:8000/ws/notifications/${user.id}/`);
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "exam_notification") {
                setNewNotification(true);
                fetchUserExams();
            }
        };
        ws.onerror = (error) => console.error("WebSocket error:", error);
        setSocket(ws);
        return () => ws.close();
    }
}, [user]);