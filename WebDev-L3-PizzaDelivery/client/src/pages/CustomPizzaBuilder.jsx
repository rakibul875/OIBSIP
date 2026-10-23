import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import { useSocket } from "../context/SocketContext";
import {
  ChefHat,
  Check,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  Sparkles,
  AlertCircle,
} from "lucide-react";

const CustomPizzaBuilder = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { socket } = useSocket();

  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState({
    bases: [],
    sauces: [],
    cheeses: [],
    vegetables: [],
  });

  const [currentStep, setCurrentStep] = useState(1);

  const [selectedBase, setSelectedBase] = useState(null);
  const [selectedSauce, setSelectedSauce] = useState(null);
  const [selectedCheese, setSelectedCheese] = useState(null);
  const [selectedVeggies, setSelectedVeggies] = useState([]);

  const fetchInventory = async () => {
    try {
      const res = await api.get("/inventory");
      if (res.data.success) {
        setInventory(res.data.categorized);

        if (!selectedBase && res.data.categorized.bases.length > 0) {
          setSelectedBase(res.data.categorized.bases[0]);
        }
        if (!selectedSauce && res.data.categorized.sauces.length > 0) {
          setSelectedSauce(res.data.categorized.sauces[0]);
        }
        if (!selectedCheese && res.data.categorized.cheeses.length > 0) {
          setSelectedCheese(res.data.categorized.cheeses[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load inventory for builder:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleBatchUpdate = (updatedList) => {
      fetchInventory();
    };

    socket.on("inventoryBatchUpdated", handleBatchUpdate);
    socket.on("inventoryUpdated", handleBatchUpdate);

    return () => {
      socket.off("inventoryBatchUpdated", handleBatchUpdate);
      socket.off("inventoryUpdated", handleBatchUpdate);
    };
  }, [socket]);

  const toggleVegetable = (veg) => {
    const exists = selectedVeggies.find((v) => v._id === veg._id);
    if (exists) {
      setSelectedVeggies(selectedVeggies.filter((v) => v._id !== veg._id));
    } else {
      setSelectedVeggies([...selectedVeggies, veg]);
    }
  };

  const basePrice = selectedBase ? selectedBase.unitPrice : 0;
  const saucePrice = selectedSauce ? selectedSauce.unitPrice : 0;
  const cheesePrice = selectedCheese ? selectedCheese.unitPrice : 0;
  const veggiesPrice = selectedVeggies.reduce((sum, v) => sum + v.unitPrice, 0);
  const totalPrice = basePrice + saucePrice + cheesePrice + veggiesPrice;

  const handleAddToCart = () => {
    if (!selectedBase || !selectedSauce || !selectedCheese) {
      alert("Please complete Base, Sauce, and Cheese selections.");
      return;
    }

    const customPizza = {
      pizzaType: "custom",
      name: `Custom Artisan (${selectedBase.name})`,
      price: totalPrice,
      quantity: 1,
      customDetails: {
        base: { id: selectedBase._id, name: selectedBase.name },
        sauce: { id: selectedSauce._id, name: selectedSauce.name },
        cheese: { id: selectedCheese._id, name: selectedCheese.name },
        vegetables: selectedVeggies.map((v) => ({ id: v._id, name: v.name })),
      },
    };

    addToCart(customPizza);
    navigate("/order-summary");
  };

  const stepsMeta = [
    { num: 1, label: "Artisan Base", category: "bases" },
    { num: 2, label: "Gourmet Sauce", category: "sauces" },
    { num: 3, label: "Artisan Cheese", category: "cheeses" },
    { num: 4, label: "Farm Vegetables", category: "vegetables" },
  ];

  if (loading) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "6rem 0",
          color: "var(--text-muted)",
        }}
      >
        <ChefHat
          size={40}
          color="var(--accent-orange)"
          style={{ animation: "bounce 1s infinite" }}
        />
        <p style={{ marginTop: "1rem", fontSize: "1.1rem" }}>
          Preheating the Pizza Studio...
        </p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "3rem 1.5rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <div className="badge badge-orange" style={{ marginBottom: "0.8rem" }}>
          <Sparkles size={14} /> Custom Creation Studio
        </div>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
          Design Your Custom Pizza
        </h1>
        <p
          style={{
            color: "var(--text-muted)",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          4 simple steps. Handpicked dough, rich reduction sauce, melted cheese
          & farm greens.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "1rem",
          marginBottom: "2.5rem",
          flexWrap: "wrap",
        }}
      >
        {stepsMeta.map((s) => (
          <button
            key={s.num}
            onClick={() => setCurrentStep(s.num)}
            style={{
              background:
                currentStep === s.num
                  ? "var(--accent-orange)"
                  : "rgba(255, 255, 255, 0.05)",
              color: currentStep === s.num ? "white" : "var(--text-muted)",
              border: `1px solid ${currentStep === s.num ? "var(--accent-orange)" : "var(--border-glass)"}`,
              padding: "0.65rem 1.25rem",
              borderRadius: "25px",
              fontFamily: "var(--font-heading)",
              fontWeight: 600,
              fontSize: "0.9rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              transition: "var(--transition)",
            }}
          >
            <span
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "50%",
                background:
                  currentStep === s.num
                    ? "rgba(0,0,0,0.2)"
                    : "rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
              }}
            >
              {s.num}
            </span>
            {s.label}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 0.8fr",
          gap: "2.5rem",
          alignItems: "start",
        }}
      >
        <div>
          {currentStep === 1 && (
            <div>
              <div style={{ marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1.5rem", marginBottom: "0.3rem" }}>
                  Step 1: Choose Your Dough Base
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  Select 1 of 5 signature artisan crust varieties.
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {inventory.bases.map((base) => {
                  const isSelected = selectedBase?._id === base._id;
                  const isOutOfStock = base.stock <= 0;

                  return (
                    <div
                      key={base._id}
                      onClick={() => !isOutOfStock && setSelectedBase(base)}
                      className="glass-panel"
                      style={{
                        padding: "1.25rem",
                        cursor: isOutOfStock ? "not-allowed" : "pointer",
                        borderColor: isSelected
                          ? "var(--accent-orange)"
                          : undefined,
                        background: isSelected
                          ? "rgba(255, 94, 40, 0.08)"
                          : undefined,
                        opacity: isOutOfStock ? 0.5 : 1,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        transition: "var(--transition)",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.6rem",
                            marginBottom: "0.3rem",
                          }}
                        >
                          <h4 style={{ fontSize: "1.1rem" }}>{base.name}</h4>
                          {base.stock <= base.threshold && base.stock > 0 && (
                            <span
                              className="badge badge-amber"
                              style={{ fontSize: "0.65rem" }}
                            >
                              Only {base.stock} Left!
                            </span>
                          )}
                          {isOutOfStock && (
                            <span
                              className="badge badge-red"
                              style={{ fontSize: "0.65rem" }}
                            >
                              Out of Stock
                            </span>
                          )}
                        </div>
                        <p
                          style={{
                            color: "var(--text-muted)",
                            fontSize: "0.85rem",
                          }}
                        >
                          {base.description}
                        </p>
                      </div>

                      <div style={{ textAlign: "right", minWidth: "90px" }}>
                        <div
                          style={{
                            fontSize: "1.15rem",
                            fontWeight: 800,
                            color: "var(--text-main)",
                          }}
                        >
                          ₹{base.unitPrice}
                        </div>
                        <div
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            border: `2px solid ${isSelected ? "var(--accent-orange)" : "var(--text-dim)"}`,
                            background: isSelected
                              ? "var(--accent-orange)"
                              : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginLeft: "auto",
                            marginTop: "6px",
                          }}
                        >
                          {isSelected && <Check size={14} color="white" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <div style={{ marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1.5rem", marginBottom: "0.3rem" }}>
                  Step 2: Choose Your Gourmet Sauce
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  Select 1 of 5 rich, slow-simmered sauces.
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {inventory.sauces.map((sauce) => {
                  const isSelected = selectedSauce?._id === sauce._id;
                  const isOutOfStock = sauce.stock <= 0;

                  return (
                    <div
                      key={sauce._id}
                      onClick={() => !isOutOfStock && setSelectedSauce(sauce)}
                      className="glass-panel"
                      style={{
                        padding: "1.25rem",
                        cursor: isOutOfStock ? "not-allowed" : "pointer",
                        borderColor: isSelected
                          ? "var(--accent-orange)"
                          : undefined,
                        background: isSelected
                          ? "rgba(255, 94, 40, 0.08)"
                          : undefined,
                        opacity: isOutOfStock ? 0.5 : 1,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        transition: "var(--transition)",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.6rem",
                            marginBottom: "0.3rem",
                          }}
                        >
                          <h4 style={{ fontSize: "1.1rem" }}>{sauce.name}</h4>
                          {sauce.stock <= sauce.threshold &&
                            sauce.stock > 0 && (
                              <span
                                className="badge badge-amber"
                                style={{ fontSize: "0.65rem" }}
                              >
                                Only {sauce.stock} Left!
                              </span>
                            )}
                          {isOutOfStock && (
                            <span
                              className="badge badge-red"
                              style={{ fontSize: "0.65rem" }}
                            >
                              Out of Stock
                            </span>
                          )}
                        </div>
                        <p
                          style={{
                            color: "var(--text-muted)",
                            fontSize: "0.85rem",
                          }}
                        >
                          {sauce.description}
                        </p>
                      </div>

                      <div style={{ textAlign: "right", minWidth: "90px" }}>
                        <div
                          style={{
                            fontSize: "1.15rem",
                            fontWeight: 800,
                            color: "var(--text-main)",
                          }}
                        >
                          ₹{sauce.unitPrice}
                        </div>
                        <div
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            border: `2px solid ${isSelected ? "var(--accent-orange)" : "var(--text-dim)"}`,
                            background: isSelected
                              ? "var(--accent-orange)"
                              : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginLeft: "auto",
                            marginTop: "6px",
                          }}
                        >
                          {isSelected && <Check size={14} color="white" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <div style={{ marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1.5rem", marginBottom: "0.3rem" }}>
                  Step 3: Select Your Melted Cheese
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  Choose from authentic Italian, English & vegan varieties.
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {inventory.cheeses.map((cheese) => {
                  const isSelected = selectedCheese?._id === cheese._id;
                  const isOutOfStock = cheese.stock <= 0;

                  return (
                    <div
                      key={cheese._id}
                      onClick={() => !isOutOfStock && setSelectedCheese(cheese)}
                      className="glass-panel"
                      style={{
                        padding: "1.25rem",
                        cursor: isOutOfStock ? "not-allowed" : "pointer",
                        borderColor: isSelected
                          ? "var(--accent-orange)"
                          : undefined,
                        background: isSelected
                          ? "rgba(255, 94, 40, 0.08)"
                          : undefined,
                        opacity: isOutOfStock ? 0.5 : 1,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        transition: "var(--transition)",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.6rem",
                            marginBottom: "0.3rem",
                          }}
                        >
                          <h4 style={{ fontSize: "1.1rem" }}>{cheese.name}</h4>
                          {cheese.stock <= cheese.threshold &&
                            cheese.stock > 0 && (
                              <span
                                className="badge badge-amber"
                                style={{ fontSize: "0.65rem" }}
                              >
                                Only {cheese.stock} Left!
                              </span>
                            )}
                          {isOutOfStock && (
                            <span
                              className="badge badge-red"
                              style={{ fontSize: "0.65rem" }}
                            >
                              Out of Stock
                            </span>
                          )}
                        </div>
                        <p
                          style={{
                            color: "var(--text-muted)",
                            fontSize: "0.85rem",
                          }}
                        >
                          {cheese.description}
                        </p>
                      </div>

                      <div style={{ textAlign: "right", minWidth: "90px" }}>
                        <div
                          style={{
                            fontSize: "1.15rem",
                            fontWeight: 800,
                            color: "var(--text-main)",
                          }}
                        >
                          ₹{cheese.unitPrice}
                        </div>
                        <div
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            border: `2px solid ${isSelected ? "var(--accent-orange)" : "var(--text-dim)"}`,
                            background: isSelected
                              ? "var(--accent-orange)"
                              : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginLeft: "auto",
                            marginTop: "6px",
                          }}
                        >
                          {isSelected && <Check size={14} color="white" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <div style={{ marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1.5rem", marginBottom: "0.3rem" }}>
                  Step 4: Load Fresh Vegetables (Multi-Select)
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  Select as many farm-fresh toppings as your heart desires.
                </p>
              </div>

              <div className="grid-cols-2">
                {inventory.vegetables.map((veg) => {
                  const isSelected = !!selectedVeggies.find(
                    (v) => v._id === veg._id,
                  );
                  const isOutOfStock = veg.stock <= 0;

                  return (
                    <div
                      key={veg._id}
                      onClick={() => !isOutOfStock && toggleVegetable(veg)}
                      className="glass-panel"
                      style={{
                        padding: "1.1rem",
                        cursor: isOutOfStock ? "not-allowed" : "pointer",
                        borderColor: isSelected
                          ? "var(--accent-green)"
                          : undefined,
                        background: isSelected
                          ? "rgba(16, 185, 129, 0.08)"
                          : undefined,
                        opacity: isOutOfStock ? 0.5 : 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        gap: "0.8rem",
                        transition: "var(--transition)",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                          }}
                        >
                          <h4
                            style={{
                              fontSize: "1rem",
                              color: isSelected
                                ? "#10b981"
                                : "var(--text-main)",
                            }}
                          >
                            {veg.name}
                          </h4>
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: "0.95rem",
                              color: "var(--text-main)",
                            }}
                          >
                            +₹{veg.unitPrice}
                          </span>
                        </div>
                        <p
                          style={{
                            color: "var(--text-muted)",
                            fontSize: "0.8rem",
                            marginTop: "4px",
                          }}
                        >
                          {veg.description}
                        </p>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        {veg.stock <= veg.threshold && veg.stock > 0 ? (
                          <span
                            style={{
                              fontSize: "0.72rem",
                              color: "var(--accent-amber)",
                            }}
                          >
                            ⚡ {veg.stock} in stock
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: "0.72rem",
                              color: "var(--text-dim)",
                            }}
                          >
                            Fresh
                          </span>
                        )}

                        <div
                          style={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "4px",
                            border: `2px solid ${isSelected ? "var(--accent-green)" : "var(--text-dim)"}`,
                            background: isSelected
                              ? "var(--accent-green)"
                              : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {isSelected && <Check size={12} color="white" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "2.5rem",
              paddingTop: "1.5rem",
              borderTop: "1px solid var(--border-glass)",
            }}
          >
            {currentStep > 1 ? (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="btn-secondary"
              >
                <ArrowLeft size={16} /> Back to Step {currentStep - 1}
              </button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="btn-primary"
              >
                Next Step <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                className="btn-primary"
                style={{
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  boxShadow: "0 4px 15px rgba(16, 185, 129, 0.4)",
                }}
              >
                <ShoppingBag size={18} /> Add Custom Pizza to Cart (₹
                {totalPrice})
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Live Visualizer & Dynamic Price Summary */}
        <div
          className="glass-panel"
          style={{ padding: "2rem", position: "sticky", top: "100px" }}
        >
          <h3
            style={{
              fontSize: "1.25rem",
              marginBottom: "1.2rem",
              textAlign: "center",
            }}
          >
            Live Recipe Preview
          </h3>

          {/* Interactive Pizza Visualizer */}
          <div className="pizza-stage-wrapper">
            <div className="pizza-visual-base">
              <div className="pizza-visual-sauce">
                <div className="pizza-visual-cheese">
                  <div className="pizza-visual-veggies">
                    {selectedVeggies.map((veg, idx) => (
                      <span
                        key={veg._id}
                        style={{
                          position: "absolute",
                          top: `${20 + ((idx * 27) % 65)}%`,
                          left: `${20 + ((idx * 33) % 65)}%`,
                          fontSize: "18px",
                          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
                        }}
                      ></span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: "2rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.8rem",
              fontSize: "0.9rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                color: "var(--text-muted)",
              }}
            >
              <span>Dough Base:</span>
              <span style={{ color: "var(--text-main)", fontWeight: 600 }}>
                {selectedBase
                  ? `${selectedBase.name} (₹${selectedBase.unitPrice})`
                  : "None"}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                color: "var(--text-muted)",
              }}
            >
              <span>Sauce:</span>
              <span style={{ color: "var(--text-main)", fontWeight: 600 }}>
                {selectedSauce
                  ? `${selectedSauce.name} (₹${selectedSauce.unitPrice})`
                  : "None"}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                color: "var(--text-muted)",
              }}
            >
              <span>Cheese:</span>
              <span style={{ color: "var(--text-main)", fontWeight: 600 }}>
                {selectedCheese
                  ? `${selectedCheese.name} (₹${selectedCheese.unitPrice})`
                  : "None"}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                color: "var(--text-muted)",
              }}
            >
              <span>Vegetables ({selectedVeggies.length}):</span>
              <span style={{ color: "var(--text-main)", fontWeight: 600 }}>
                +₹{veggiesPrice}
              </span>
            </div>

            {selectedVeggies.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "4px",
                  marginTop: "4px",
                }}
              >
                {selectedVeggies.map((v) => (
                  <span
                    key={v._id}
                    className="badge badge-green"
                    style={{ fontSize: "0.68rem" }}
                  >
                    {v.name}
                  </span>
                ))}
              </div>
            )}

            <div
              style={{
                borderTop: "1px solid var(--border-glass)",
                paddingTop: "1rem",
                marginTop: "0.5rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
              }}
            >
              <span style={{ fontSize: "1rem", fontWeight: 600 }}>
                Calculated Total:
              </span>
              <span
                style={{
                  fontSize: "1.6rem",
                  fontWeight: 800,
                  color: "var(--accent-orange)",
                  fontFamily: "var(--font-heading)",
                }}
              >
                ₹{totalPrice}
              </span>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className="btn-primary"
            style={{ width: "100%", marginTop: "1.5rem", padding: "0.85rem" }}
          >
            <ShoppingBag size={18} /> Add to Cart & Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomPizzaBuilder;
