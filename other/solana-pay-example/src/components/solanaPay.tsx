
import { Keypair, PublicKey } from "@solana/web3.js";
import { createQR, encodeURL } from "@solana/pay";
import BigNumber from "bignumber.js";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSolanaWallet } from "@web3auth/modal/react/solana";

export function SolanaPay() {
    const { accounts } = useSolanaWallet();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [amountToSend, setAmountToSend] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [qrUrl, setQrUrl] = useState<string>("");
    const qrRef = useRef<HTMLDivElement>(null);

    const generateQrCode = () => {
        try {
            if (!accounts?.[0]) {
                setError("No wallet connected");
                return;
            }

            setIsLoading(true);
            setError(null);
            // set the parameter of the transfer
            const recipient = new PublicKey(accounts?.[0]!);
            const amount = new BigNumber(amountToSend);
            // reference should be a unique ID for the payment
            const reference = new Keypair().publicKey;
            // Label and message are optional. They will be shown in wallets when users scan it but won't show on chain
            const label = "MetaMask Embedded Wallet x Solana Pay Demo";
            const message = "Thanks for Trying Solana Pay!";
            // memo is optional and will be included in the onchain transaction
            const memo = "Thanks for Trying Solana Pay!";
            // create the URL
            const url = encodeURL({
                recipient,
                amount,
                reference,
                label,
                message,
                memo,
            });

            setQrUrl(url.toString());
            setShowModal(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to generate QR code");
        } finally {
            setIsLoading(false);
        }
    };

    // Generate QR code when modal opens and URL is available
    useEffect(() => {
        if (showModal && qrUrl && qrRef.current) {
            qrRef.current.innerHTML = "";
            try {
                const qr = createQR(qrUrl, 300, "white");
                qr.append(qrRef.current);
            } catch (err) {
                setError("Failed to create QR code");
            }
        }
    }, [showModal, qrUrl]);

    const closeModal = () => {
        setShowModal(false);
        setQrUrl("");
        setError(null);
    };
  
    return (
      <>
        <div>
          <h2>Solana Pay QR</h2>
          <div className="flex flex-col items-center gap-4">
            <input
              type="number"
              placeholder="Enter SOL amount"
              onChange={(e) => setAmountToSend(Number(e.target.value))}
              className="px-4 py-2 border rounded-lg text-black"
              step="0.01"
              min="0"
            />
            <button
              onClick={generateQrCode}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              disabled={isLoading || amountToSend <= 0}
            >
              {isLoading ? "Generating..." : "Generate Payment QR"}
            </button>
            
            {/* Error Display */}
            {error && !showModal && (
              <div className="text-red-500 text-sm mt-2">
                Error: {error}
              </div>
            )}
          </div>
        </div>

        {/* Modal using Portal - renders at body level */}
        {showModal && createPortal(
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '16px'
            }}
            onClick={closeModal}
          >
            <div 
              style={{
                backgroundColor: 'var(--bg-color)',
                borderRadius: 'var(--radius)',
                padding: '24px',
                width: '400px',
                maxWidth: '90vw',
                position: 'relative',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid var(--border-color)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={closeModal}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                ×
              </button>
              
              {/* Modal Content */}
              <div style={{ textAlign: 'center', paddingTop: '8px' }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  marginBottom: '16px', 
                  color: 'var(--text-color)',
                  paddingRight: '32px'
                }}>
                  Pay {amountToSend} SOL
                </h3>
                
                {/* QR Code Display Area */}
                <div ref={qrRef} style={{ 
                  marginBottom: '16px', 
                  display: 'flex', 
                  justifyContent: 'center',
                  minHeight: '300px',
                  alignItems: 'center'
                }} />
                
                {/* Error Display in Modal */}
                {error && (
                  <div style={{ 
                    color: 'red', 
                    fontSize: '14px', 
                    marginBottom: '12px' 
                  }}>
                    {error}
                  </div>
                )}
                
                <p style={{ 
                  color: 'var(--text-muted)', 
                  fontSize: '12px', 
                  marginBottom: '16px' 
                }}>
                  Scan with your Solana wallet
                </p>
              </div>
            </div>
          </div>,
          document.body
        )}
      </>
    )
}