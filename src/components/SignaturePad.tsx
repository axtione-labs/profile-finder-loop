import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eraser, PenTool, Type } from "lucide-react";

interface SignaturePadProps {
  onSignatureChange: (data: string, type: "draw" | "text") => void;
}

const SignaturePad = ({ onSignatureChange }: SignaturePadProps) => {
  const [mode, setMode] = useState<"draw" | "text">("draw");
  const [textSignature, setTextSignature] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  const getCtx = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.strokeStyle = "#1a1a2e";
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
    return ctx;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(2, 2);
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const touch = "touches" in e ? e.touches[0] : e;
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isDrawing.current = true;
    lastPoint.current = getPos(e);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current) return;
    e.preventDefault();
    const ctx = getCtx();
    if (!ctx || !lastPoint.current) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPoint.current = pos;
  };

  const endDraw = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    lastPoint.current = null;
    if (canvasRef.current) {
      onSignatureChange(canvasRef.current.toDataURL("image/png"), "draw");
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    onSignatureChange("", "draw");
  };

  const handleTextChange = (value: string) => {
    setTextSignature(value);
    if (value.trim()) {
      // Create a canvas with the text in signature font
      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 200;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 600, 200);
      ctx.font = "italic 48px 'Dancing Script', 'Brush Script MT', cursive";
      ctx.fillStyle = "#1a1a2e";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(value, 300, 100);
      onSignatureChange(canvas.toDataURL("image/png"), "text");
    } else {
      onSignatureChange("", "text");
    }
  };

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={mode === "draw" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("draw")}
          className={mode === "draw" ? "gradient-primary border-0" : ""}
        >
          <PenTool className="mr-2 h-4 w-4" /> Dessiner
        </Button>
        <Button
          type="button"
          variant={mode === "text" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("text")}
          className={mode === "text" ? "gradient-primary border-0" : ""}
        >
          <Type className="mr-2 h-4 w-4" /> Taper
        </Button>
      </div>

      {mode === "draw" ? (
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-full h-40 rounded-xl border-2 border-dashed border-border bg-white cursor-crosshair touch-none"
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={endDraw}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearCanvas}
            className="absolute top-2 right-2"
          >
            <Eraser className="h-4 w-4" />
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-1">
            Dessinez votre signature ci-dessus
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <Input
            placeholder="Tapez votre nom complet"
            value={textSignature}
            onChange={(e) => handleTextChange(e.target.value)}
            className="bg-background/50"
          />
          {textSignature && (
            <div className="flex items-center justify-center h-24 rounded-xl border border-border bg-white">
              <span
                className="text-4xl text-foreground"
                style={{ fontFamily: "'Dancing Script', 'Brush Script MT', cursive", fontStyle: "italic" }}
              >
                {textSignature}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SignaturePad;
