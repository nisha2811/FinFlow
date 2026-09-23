import {
 Navigate
}
from "react-router-dom";

function ProtectedRoute({
    children,
    allowedRoles,
}) {
        const token = localStorage.getItem("token");
        if (!token) 
        {
            return (
                <Navigate to="/" />
            );
        }
        if (allowedRoles && !allowedRoles.includes(localStorage.getItem("role"))) {
            return <Navigate to="/dashboard" replace />;
        }
        return children;
}

export default ProtectedRoute;