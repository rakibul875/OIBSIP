import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import api from "../services/api";
import { useSocket } from "../context/SocketContext";
import OrderStatusStepper from "../components/OrderStatusStepper";
import {
  Package,
  Clock,
  MapPin,
  ChefHat,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BellRing,
} from "lucide-react";

const UserDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeNotification, setActiveNotification] = useState("");
  const location = useLocation();
  const { socket, joinOrderRoom } = useSocket();

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders/my-orders");
      if (res.data.success) {
        setOrders(res.data.orders);

        if (socket) {
          res.data.orders.forEach((ord) => {
            if (
              ord.orderStatus !== "Delivered" &&
              ord.orderStatus !== "Cancelled"
            ) {
              joinOrderRoom(ord._id);
            }
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch user orders:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const handleStatusUpdate = ({ orderId, newStatus, updatedOrder }) => {
      console.log(
        `[Socket.io Notification] Order ${orderId} updated to: ${newStatus}`,
      );
      setActiveNotification(
        `🎉 Status Update: Order #${orderId.slice(-6).toUpperCase()} is now "${newStatus}"!`,
      );

      setOrders((prevOrders) =>
        prevOrders.map((ord) =>
          ord._id === orderId
            ? { ...ord, orderStatus: newStatus, ...updatedOrder }
            : ord,
        ),
      );

      setTimeout(() => {
        setActiveNotification("");
      }, 6000);
    };

    socket.on("orderStatusUpdated", handleStatusUpdate);

    return () => {
      socket.off("orderStatusUpdated", handleStatusUpdate);
    };
  }, [socket]);

  const activeOrder = orders.find(
    (o) => o.orderStatus !== "Delivered" && o.orderStatus !== "Cancelled",
  );

  const pastOrders = orders.filter((o) => o._id !== activeOrder?._id);

  if (loading) {
    return (
      <div
        className="container"
        style={{
          textAlign: "center",
          padding: "6rem 0",
          color: "var(--text-muted)",
        }}
      >
        <Clock
          size={40}
          color="var(--accent-orange)"
          style={{ animation: "spin 2s linear infinite" }}
        />
        <p style={{ marginTop: "1rem" }}>
          Loading your dashboard & active orders...
        </p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "3rem 1.5rem" }}>
      {activeNotification && (
        <div
          style={{
            position: "fixed",
            top: "90px",
            right: "25px",
            zIndex: 9999,
            background: "linear-gradient(135deg, #ff5e28, #ea580c)",
            color: "white",
            padding: "1rem 1.5rem",
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(255, 94, 40, 0.5)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            animation: "bounce 0.5s ease",
          }}
        >
          <BellRing size={22} />
          <div>
            <strong style={{ display: "block", fontSize: "0.9rem" }}>
              Real-time Delivery Update
            </strong>
            <span style={{ fontSize: "0.85rem" }}>{activeNotification}</span>
          </div>
        </div>
      )}

      <div style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "2.4rem", marginBottom: "0.4rem" }}>
          User Dashboard & Order Tracker
        </h1>
        <p style={{ color: "var(--text-muted)" }}>
          Monitor your handcrafted pizzas from the oven to your dining table in
          real-time.
        </p>
      </div>

      {activeOrder ? (
        <div
          className="glass-panel"
          style={{
            padding: "2rem",
            marginBottom: "3.5rem",
            border: "1.5px solid var(--accent-orange)",
            background:
              "linear-gradient(180deg, rgba(255, 94, 40, 0.08) 0%, rgba(22, 27, 38, 0.8) 100%)",
            boxShadow: "0 10px 30px -5px rgba(255, 94, 40, 0.2)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span
                  className="badge badge-orange"
                  style={{ animation: "pulse-ring 2s infinite" }}
                >
                  ● Live Active Order
                </span>
                <span style={{ color: "var(--text-dim)", fontSize: "0.85rem" }}>
                  #{activeOrder._id.slice(-6).toUpperCase()}
                </span>
              </div>
              <h2 style={{ fontSize: "1.6rem", marginTop: "0.4rem" }}>
                Currently:{" "}
                <span style={{ color: "var(--accent-orange)" }}>
                  {activeOrder.orderStatus}
                </span>
              </h2>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                Placed On
              </div>
              <div style={{ fontSize: "0.95rem", fontWeight: 600 }}>
                {new Date(activeOrder.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                , {new Date(activeOrder.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          <OrderStatusStepper currentStatus={activeOrder.orderStatus} />

          <div
            style={{
              background: "rgba(10, 12, 16, 0.6)",
              borderRadius: "10px",
              padding: "1.25rem",
              marginTop: "1.5rem",
              display: "grid",
              gridTemplateColumns: "1.5fr 1fr",
              gap: "1.5rem",
            }}
          >
            <div>
              <h4
                style={{
                  fontSize: "0.95rem",
                  marginBottom: "0.8rem",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Pizza Items ({activeOrder.items.length})
              </h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                {activeOrder.items.map((it, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.9rem",
                    }}
                  >
                    <span>
                      {it.name}{" "}
                      <strong style={{ color: "var(--accent-orange)" }}>
                        x{it.quantity}
                      </strong>
                    </span>
                    <span style={{ fontWeight: 600 }}>
                      ₹{it.price * it.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                borderLeft: "1px solid var(--border-glass)",
                paddingLeft: "1.5rem",
              }}
            >
              <h4
                style={{
                  fontSize: "0.95rem",
                  marginBottom: "0.8rem",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Delivery Address
              </h4>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                  lineHeight: "1.5",
                }}
              >
                {activeOrder.deliveryAddress.street},{" "}
                {activeOrder.deliveryAddress.city},{" "}
                {activeOrder.deliveryAddress.state} -{" "}
                {activeOrder.deliveryAddress.zipCode}
              </p>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-main)",
                  marginTop: "4px",
                  fontWeight: 600,
                }}
              >
                {activeOrder.deliveryAddress.phone}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="glass-panel"
          style={{
            padding: "2rem",
            textAlign: "center",
            marginBottom: "3rem",
            background: "rgba(255, 255, 255, 0.02)",
          }}
        >
          <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
            No active orders currently baking.
          </p>
          <Link
            to="/custom-builder"
            className="btn-primary"
            style={{ display: "inline-flex", padding: "0.7rem 1.5rem" }}
          >
            <ChefHat size={18} /> Craft a Pizza Now
          </Link>
        </div>
      )}

      <div>
        <h3
          style={{
            fontSize: "1.4rem",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Package size={20} color="var(--accent-orange)" /> Past Order History
        </h3>

        {pastOrders.length === 0 && !activeOrder ? (
          <div
            style={{
              textAlign: "center",
              padding: "3rem 0",
              color: "var(--text-muted)",
            }}
          >
            No orders found. Once you place an order, it will appear here!
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {pastOrders.map((ord) => (
              <div
                key={ord._id}
                className="glass-panel"
                style={{
                  padding: "1.5rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <h4 style={{ fontSize: "1.1rem" }}>
                      Order #{ord._id.slice(-6).toUpperCase()}
                    </h4>
                    <span
                      className={`badge ${ord.orderStatus === "Delivered" ? "badge-green" : "badge-amber"}`}
                    >
                      {ord.orderStatus}
                    </span>
                    <span className="badge badge-blue">
                      Paid ₹{ord.totalAmount}
                    </span>
                  </div>

                  <p
                    style={{
                      color: "var(--text-muted)",
                      fontSize: "0.85rem",
                      marginTop: "6px",
                    }}
                  >
                    {ord.items
                      .map((i) => `${i.name} (x${i.quantity})`)
                      .join(", ")}
                  </p>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div
                    style={{ fontSize: "0.82rem", color: "var(--text-dim)" }}
                  >
                    {new Date(ord.createdAt).toLocaleDateString()} at{" "}
                    {new Date(ord.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
