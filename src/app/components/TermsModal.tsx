import React, { useState } from 'react';

interface TermsModalProps {
    onConfirm: () => void;
}

export default function TermsModal({ onConfirm }: TermsModalProps) {
    const [isChecked, setIsChecked] = useState(false);

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '600px' }}>
                <h2>Terms and Conditions</h2>

                <div
                    className="terms-content"
                    style={{
                        maxHeight: '300px',
                        overflowY: 'auto',
                        textAlign: 'left',
                        border: '1px solid #ccc',
                        padding: '15px',
                        marginBottom: '20px',
                        borderRadius: '4px',
                        backgroundColor: '#f9f9f9',
                        whiteSpace: 'pre-wrap' // Preserve newlines
                    }}
                >
                    <div style={{ marginBottom: '15px' }}>
                        <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>1. Competition Period</p>
                        <p>The competition runs until 22 December (inclusive).</p>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>2. Voluntary Participation</p>
                        <p>Participation is fully voluntary.</p>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>3. Prize Draw</p>
                        <p>Among all participants who submit a correct answer, ten (10) AirPods will be awarded.</p>
                        <p>Winners will be selected in a fully random draw, based solely on chance.</p>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>4. Prize Conditions</p>
                        <p>Prizes are personal, non-transferable, and cannot be exchanged or redeemed for cash.</p>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>5. Company Rights</p>
                        <p>The Company may verify eligibility and address technical or procedural issues if needed.</p>
                    </div>
                </div>

                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <input
                        type="checkbox"
                        id="terms-check"
                        checked={isChecked}
                        onChange={(e) => setIsChecked(e.target.checked)}
                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                    <label htmlFor="terms-check" style={{ cursor: 'pointer', fontSize: '1rem' }}>
                        I have read and agree to the Terms and Conditions
                    </label>
                </div>

                <button
                    onClick={onConfirm}
                    className="tool-btn"
                    disabled={!isChecked}
                >
                    Continue
                </button>
            </div>
        </div>
    );
}
