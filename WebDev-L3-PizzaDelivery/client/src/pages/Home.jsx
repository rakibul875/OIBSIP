import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import {
  ChefHat,
  ShoppingBag,
  Flame,
  Sparkles,
  Check,
  ArrowRight,
} from "lucide-react";

const Home = () => {
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchPizzas = async () => {
      try {
        const res = await api.get("/pizzas");
        if (res.data.success) {
          setPizzas(res.data.pizzas);
        }
      } catch (err) {
        console.error("Failed to load pizzas:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPizzas();
  }, []);

  const handleAddToCart = (pizza) => {
    addToCart({
      pizzaType: "preset",
      presetPizzaId: pizza._id,
      name: pizza.name,
      price: pizza.price,
      quantity: 1,
    });
    setAddedId(pizza._id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div>
      <section
        style={{
          padding: "5rem 0 3rem 0",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          className="container"
          style={{ textAlign: "center", maxWidth: "800px" }}
        >
          <div
            className="badge badge-orange"
            style={{ marginBottom: "1.2rem", padding: "0.4rem 1rem" }}
          >
            <Sparkles size={14} /> Level 3 Artisan Pizza Crafting
          </div>
          <h1
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              lineHeight: "1.1",
              marginBottom: "1.5rem",
              fontWeight: 800,
            }}
          >
            Handcrafted Sourdough Crust. <br />
            <span className="brand-gradient">Engineered to Perfection.</span>
          </h1>
          <p
            style={{
              fontSize: "1.15rem",
              color: "var(--text-muted)",
              marginBottom: "2.5rem",
              maxWidth: "650px",
              margin: "0 auto 2.5rem auto",
            }}
          >
            Choose from chef-curated signature varieties or design your
            masterpiece layer-by-layer: 5 artisan doughs, 5 gourmet sauces,
            melted cheeses & fresh farm greens.
          </p>

          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              to="/custom-builder"
              className="btn-primary"
              style={{ padding: "0.9rem 2rem", fontSize: "1.05rem" }}
            >
              <ChefHat size={20} /> Build Custom Pizza <ArrowRight size={18} />
            </Link>
            <a
              href="#signature-menu"
              className="btn-secondary"
              style={{ padding: "0.9rem 2rem", fontSize: "1.05rem" }}
            >
              View Artisan Menu
            </a>
          </div>
        </div>
      </section>

      <section
        id="signature-menu"
        className="container"
        style={{ padding: "3rem 1.5rem" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "2.5rem",
          }}
        >
          <div>
            <div
              className="badge badge-amber"
              style={{ marginBottom: "0.5rem" }}
            >
              <Flame size={12} /> Chef Specialties
            </div>
            <h2 style={{ fontSize: "2rem" }}>Chef-Curated Signature Pizzas</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
              Authentic woodfired recipes ready in minutes.
            </p>
          </div>
          <Link
            to="/custom-builder"
            className="btn-outline-orange"
            style={{ fontSize: "0.88rem" }}
          >
            Custom Builder
          </Link>
        </div>

        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "4rem 0",
              color: "var(--text-muted)",
            }}
          >
            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🍕</div>
            Baking menu options...
          </div>
        ) : (
          <div className="grid-cols-3">
            {pizzas.map((pizza) => (
              <div
                key={pizza._id}
                className="glass-panel"
                style={{
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  transition: "var(--transition)",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    height: "220px",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={pizza.imageUrl}
                    alt={pizza.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.4s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = "scale(1.05)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = "scale(1)")
                    }
                  />
                  {pizza.isPopular && (
                    <span
                      style={{
                        position: "absolute",
                        top: "12px",
                        left: "12px",
                        background: "linear-gradient(135deg, #f59e0b, #d97706)",
                        color: "white",
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                      }}
                    >
                      Bestseller
                    </span>
                  )}
                  <span
                    style={{
                      position: "absolute",
                      top: "12px",
                      right: "12px",
                      background: "rgba(10, 12, 16, 0.8)",
                      backdropFilter: "blur(8px)",
                      color: pizza.category === "Veg" ? "#10b981" : "#ef4444",
                      padding: "4px 8px",
                      borderRadius: "8px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    ● {pizza.category}
                  </span>
                </div>

                <div
                  style={{
                    padding: "1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: 1,
                  }}
                >
                  <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
                    {pizza.name}
                  </h3>
                  <p
                    style={{
                      color: "var(--text-muted)",
                      fontSize: "0.88rem",
                      lineHeight: "1.5",
                      marginBottom: "1.5rem",
                      flexGrow: 1,
                    }}
                  >
                    {pizza.description}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderTop: "1px solid var(--border-glass)",
                      paddingTop: "1rem",
                      marginTop: "auto",
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-dim)",
                          display: "block",
                        }}
                      >
                        Price
                      </span>
                      <span
                        style={{
                          fontSize: "1.35rem",
                          fontWeight: 800,
                          color: "var(--text-main)",
                          fontFamily: "var(--font-heading)",
                        }}
                      >
                        ₹{pizza.price}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAddToCart(pizza)}
                      className={
                        addedId === pizza._id ? "btn-secondary" : "btn-primary"
                      }
                      style={{
                        padding: "0.65rem 1.2rem",
                        fontSize: "0.88rem",
                        background:
                          addedId === pizza._id
                            ? "rgba(16, 185, 129, 0.2)"
                            : undefined,
                        color: addedId === pizza._id ? "#10b981" : undefined,
                        border:
                          addedId === pizza._id
                            ? "1px solid #10b981"
                            : undefined,
                      }}
                    >
                      {addedId === pizza._id ? (
                        <>
                          <Check size={16} /> Added!
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={16} /> Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="container" style={{ margin: "3rem auto" }}>
        <div
          className="glass-panel"
          style={{
            padding: "3.5rem 2.5rem",
            background:
              "linear-gradient(135deg, rgba(255, 94, 40, 0.12) 0%, rgba(245, 158, 11, 0.05) 100%)",
            border: "1px solid rgba(255, 94, 40, 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "2rem",
          }}
        >
          <div style={{ maxWidth: "600px" }}>
            <div
              className="badge badge-orange"
              style={{ marginBottom: "1rem" }}
            >
              Interactive 4-Step Studio
            </div>
            <h2 style={{ fontSize: "2.2rem", marginBottom: "1rem" }}>
              Craving Something Unique? <br />
              <span className="brand-gradient">Be Your Own Pizzaiolo.</span>
            </h2>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "1rem",
                lineHeight: "1.6",
              }}
            >
              Step through our live visual builder: Pick between Artisan Thin,
              Cheese Burst, Pan Dough, Cauliflower Gluten-Free or Multigrain,
              match with savory sauces, choose premium cheeses, and pile on
              fresh farm-picked vegetables!
            </p>
          </div>
          <Link
            to="/custom-builder"
            className="btn-primary"
            style={{ padding: "1rem 2.2rem", fontSize: "1.1rem" }}
          >
            <ChefHat size={22} /> Open Custom Studio
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
