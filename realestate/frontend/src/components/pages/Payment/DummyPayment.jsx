import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { API_CONFIG, buildApiUrl } from "../../../config/api";
import "./DummyPayment.css";

const DummyPayment = () => {
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [merchantTransactionId, setMerchantTransactionId] = useState("");
    const navigate = useNavigate();
    const { token } = useAuth();

    useEffect(() => {
        const id = searchParams.get("merchantTransactionId");
        if (id) {
            setMerchantTransactionId(id);
        } else {
            navigate("/subscription-plans");
        }
    }, [searchParams, navigate]);

    const handlePayment = async (status) => {
        setLoading(true);
        try {
            const response = await fetch(buildApiUrl(`${API_CONFIG.PAYMENT.BASE || '/payment'}/dummy-complete`), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    merchantTransactionId,
                    status
                }),
            });

            const data = await response.json();
            if (data.success) {
                // Redirect to callback page to show success/fail UI
                navigate(`/payment/callback?merchantTransactionId=${merchantTransactionId}`);
            } else {
                alert(data.error?.message || "Payment processing failed");
            }
        } catch (error) {
            console.error("Payment error:", error);
            alert("An error occurred during payment processing");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dummy-payment-wrapper">
            <div className="dummy-payment-container">
                <div className="dummy-header">
                    <div className="secure-badge">
                        <span className="lock-icon">🔒</span>
                        <span>Secure Checkout</span>
                    </div>
                    <h1>Mock Payment Gateway</h1>
                    <p className="transaction-ref">Ref: {merchantTransactionId}</p>
                </div>

                <div className="payment-body">
                    <div className="payment-simulation">
                        <div className="card-visual">
                            <div className="chip"></div>
                            <div className="card-number">**** **** **** 4242</div>
                            <div className="card-holder">TEST CUSTOMER</div>
                        </div>
                        
                        <div className="payment-instructions">
                            <p>This is a simulated payment gateway for testing purposes.</p>
                            <p>No real money will be charged.</p>
                        </div>
                    </div>

                    <div className="action-buttons">
                        <button 
                            className="pay-btn success" 
                            disabled={loading}
                            onClick={() => handlePayment('success')}
                        >
                            {loading ? "Processing..." : "Simulate Success"}
                        </button>
                        <button 
                            className="pay-btn failure" 
                            disabled={loading}
                            onClick={() => handlePayment('failed')}
                        >
                            {loading ? "Processing..." : "Simulate Failure"}
                        </button>
                    </div>
                </div>

                <div className="payment-footer">
                    <p>Protected by TruOwners Security</p>
                </div>
            </div>
        </div>
    );
};

export default DummyPayment;
