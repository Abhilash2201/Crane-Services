import { ArrowLeft, ArrowRight, Smartphone } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";

const Wrap = styled.div`max-width: 500px; margin: 20px auto;`;
const OtpRow = styled.div`display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px;`;

export function AuthPage() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [generatedOtp, setGeneratedOtp] = useState("482913");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const navigate = useNavigate();

  const isPhoneValid = useMemo(() => /^[6-9]\d{9}$/.test(phone), [phone]);

  const handleSendOtp = () => {
    if (!isPhoneValid) {
      setError("Enter a valid 10-digit Indian mobile number.");
      setInfo("");
      return;
    }

    const nextOtp = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(nextOtp);
    setError("");
    setInfo(`OTP sent to +91 ${phone}. Demo OTP: ${nextOtp}`);
    setStep("otp");
  };

  const handleOtpChange = (value: string, index: number) => {
    const clean = value.replace(/\D/g, "").slice(0, 1);
    setOtp((prev) => {
      const next = [...prev];
      next[index] = clean;
      return next;
    });
  };

  const handleVerify = () => {
    if (otp.join("").length !== 6) {
      setError("Please enter all 6 OTP digits.");
      return;
    }
    if (otp.join("") !== generatedOtp) {
      setError("Invalid OTP. Please try again.");
      return;
    }

    setError("");
    setInfo("Verification successful. Redirecting to dashboard...");
    setTimeout(() => navigate("/dashboard"), 700);
  };

  const resetOtp = () => {
    setOtp(["", "", "", "", "", ""]);
  };

  return (
    <Wrap>
      <Card>
        <CardHeader><CardTitle style={{ display: "flex", alignItems: "center", gap: 8 }}><Smartphone size={18} /> Login / Register</CardTitle></CardHeader>
        <CardContent style={{ display: "grid", gap: 12 }}>
          {step === "phone" ? (
            <>
              <label>Mobile Number</label>
              <Input
                placeholder="98XXXXXX45"
                value={phone}
                onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))}
              />
              <Button size="lg" onClick={handleSendOtp}>Send OTP <ArrowRight size={16} /></Button>
              <small style={{ color: "#64748B" }}>By continuing, you agree to CraneHub Terms & Privacy.</small>
            </>
          ) : (
            <>
              <label>Enter 6-digit OTP</label>
              <OtpRow>
                {Array.from({ length: 6 }).map((_, index) => (
                  <Input
                    key={index}
                    inputMode="numeric"
                    maxLength={1}
                    value={otp[index]}
                    onChange={(event) => handleOtpChange(event.target.value, index)}
                    style={{ textAlign: "center" }}
                  />
                ))}
              </OtpRow>
              <Button variant="success" size="lg" onClick={handleVerify}>Verify & Continue</Button>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Button variant="outline" onClick={() => { resetOtp(); handleSendOtp(); }}>Resend OTP</Button>
                <Button variant="ghost" onClick={() => { setStep("phone"); resetOtp(); }}><ArrowLeft size={16} /> Change Number</Button>
              </div>
            </>
          )}
          {error ? <small style={{ color: "#DC2626" }}>{error}</small> : null}
          {info ? <small style={{ color: "#16A34A" }}>{info}</small> : null}
        </CardContent>
      </Card>
    </Wrap>
  );
}
