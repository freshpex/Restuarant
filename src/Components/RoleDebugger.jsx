import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  selectCurrentUser,
  selectToken,
  selectIsAdmin,
} from "../redux/selectors";

const RoleDebugger = () => {
  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectToken);
  const isAdmin = useSelector(selectIsAdmin);
  const [serverCheck, setServerCheck] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkAdminStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/user/check-admin`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to check admin status");
      }

      const data = await response.json();
      setServerCheck(data);
    } catch (err) {
      setError(err.message || "Error checking admin status");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-sm z-50 opacity-80 hover:opacity-100 transition-opacity">
      <h3 className="text-lg font-bold mb-2">Role Debugger (Dev Only)</h3>
      <div className="text-sm">
        <div>
          <span className="font-bold">UID:</span> {user.uid}
        </div>
        <div>
          <span className="font-bold">Email:</span> {user.email}
        </div>
        <div>
          <span className="font-bold">Role in state:</span>{" "}
          {user.role || "Not set"}
        </div>
        <div>
          <span className="font-bold">Is Admin:</span> {isAdmin ? "Yes" : "No"}
        </div>

        {serverCheck && (
          <>
            <hr className="my-2 border-gray-600" />
            <div>
              <span className="font-bold">Server Check:</span>
            </div>
            <div>
              <span className="font-bold">- Role:</span> {serverCheck.role}
            </div>
            <div>
              <span className="font-bold">- Is Admin:</span>{" "}
              {serverCheck.isAdmin ? "Yes" : "No"}
            </div>
            <div>
              <span className="font-bold">- User in DB:</span>{" "}
              {serverCheck.userInDb ? "Yes" : "No"}
            </div>
          </>
        )}

        {error && <div className="text-red-400 mt-2">Error: {error}</div>}

        <button
          onClick={checkAdminStatus}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded mt-2 text-xs disabled:opacity-50"
        >
          {loading ? "Checking..." : "Check Server"}
        </button>
      </div>
    </div>
  );
};

export default RoleDebugger;
