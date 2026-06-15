import * as React from 'react';
import { useEffect } from 'react';
import QRCode from 'react-qr-code';
import QRCodeLib from 'qrcode';
import { Event } from '../types/registration.types';

interface PrintableConfirmationCardProps {
  event: Event;
  agencyAddress: string;
  eventDateFormatted: string;
  eventTime: string;
  identificationCode: string;
  eventDateId: string | null;
  eventSlotId?: string;
}

const PrintableConfirmationCard: React.FC<PrintableConfirmationCardProps> = ({
  event,
  agencyAddress,
  eventDateFormatted,
  eventTime,
  identificationCode,
  eventDateId,
  eventSlotId,
}) => {
  // Inject print styles
  useEffect(() => {
    const styleId = 'print-confirmation-styles';
    if (document.getElementById(styleId)) {
      return; // Styles already injected
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
			@media print {
				body * {
					visibility: hidden;
				}
				.print-confirmation-card,
				.print-confirmation-card * {
					visibility: visible;
				}
				.print-confirmation-card {
					position: absolute;
					left: 0;
					top: 0;
					width: 100%;
					height: 100vh;
					padding: 2cm;
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					text-align: center;
				}
				@page {
					size: A4;
					margin: 0;
				}
				body {
					margin: 0;
					padding: 0;
				}
			}
			@media screen {
				.print-confirmation-card {
					display: none;
				}
			}
		`;
    document.head.appendChild(style);

    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  // Generate QR code URL
  const qrCodeValue = `https://secure.pantrytrak.com/mobile/qr_code_processing.php?code=${identificationCode.toUpperCase()}&event_date_id=${eventDateId}${
    eventSlotId ? '&event_slot_id=' + eventSlotId : ''
  }`;

  return (
    <div className="print-confirmation-card">
      <h1 className="text-4xl font-bold text-[#392947] mb-6">Registration Confirmation</h1>
      <h2 className="text-3xl font-bold text-[#392947] mb-4">{event.agencyName}</h2>
      {agencyAddress && (
        <div className="text-xl text-[#616161] mb-6">
          {agencyAddress.split(', ').map((line, index) => (
            <div key={index}>{line}</div>
          ))}
        </div>
      )}
      <div className="text-2xl font-semibold text-[#392947] mb-2">{eventDateFormatted}</div>
      <div className="text-xl text-[#392947] mb-8">{eventTime}</div>
      <div
        className="mb-8"
        style={{
          width: '400px',
          height: '400px',
          margin: '0 auto',
        }}
      >
        <QRCode
          value={qrCodeValue}
          style={{
            height: 'auto',
            maxWidth: '100%',
            width: '100%',
          }}
        />
      </div>
      <div className="mt-8">
        <div className="text-2xl font-bold text-[#392947] mb-2">Confirmation Number:</div>
        <div className="text-3xl font-bold text-[#009F56]">{identificationCode.toUpperCase()}</div>
      </div>
    </div>
  );
};

/**
 * Generate a PNG image of the confirmation card
 */
export const generateConfirmationCardPNG = async (
  event: Event,
  agencyAddress: string,
  eventDateFormatted: string,
  eventTime: string,
  identificationCode: string,
  eventDateId: string | null,
  eventSlotId?: string,
): Promise<void> => {
  try {
    // Font family constant for consistent styling across the card
    const FONT_FAMILY = "'Noto Sans', sans-serif";

    const qrCodeValue = `https://secure.pantrytrak.com/mobile/qr_code_processing.php?code=${identificationCode.toUpperCase()}&event_date_id=${eventDateId}${
      eventSlotId ? '&event_slot_id=' + eventSlotId : ''
    }`;

    // Create canvas for QR code
    const qrCanvas = document.createElement('canvas');
    await QRCodeLib.toCanvas(qrCanvas, qrCodeValue, {
      width: 400,
      margin: 2,
    });

    // Create main canvas for the confirmation card
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size for A4-like aspect ratio (8.5x11 inches at 150 DPI)
    const width = 1275; // 8.5 * 150
    const height = 1650; // 11 * 150
    canvas.width = width;
    canvas.height = height;

    // Fill background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Set styles
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';

    // Title
    ctx.font = `bold 48px ${FONT_FAMILY}`;
    ctx.fillStyle = '#392947';
    ctx.fillText('Registration Confirmation', width / 2, 100);

    // Agency Name
    ctx.font = `bold 36px ${FONT_FAMILY}`;
    ctx.fillStyle = '#392947';
    ctx.fillText(event.agencyName, width / 2, 180);

    // Agency Address
    if (agencyAddress) {
      ctx.font = `24px ${FONT_FAMILY}`;
      ctx.fillStyle = '#616161';
      const addressLines = agencyAddress.split(', ');
      let yOffset = 240;
      addressLines.forEach((line) => {
        ctx.fillText(line, width / 2, yOffset);
        yOffset += 35;
      });
    }

    // Event Date and Time
    ctx.font = `28px ${FONT_FAMILY}`;
    ctx.fillStyle = '#392947';
    ctx.fillText(eventDateFormatted, width / 2, 380);
    ctx.font = `24px ${FONT_FAMILY}`;
    ctx.fillText(eventTime, width / 2, 420);

    // QR Code
    const qrSize = 400;
    const qrX = (width - qrSize) / 2;
    const qrY = 500;
    ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

    // Confirmation Number
    ctx.font = `bold 32px ${FONT_FAMILY}`;
    ctx.fillStyle = '#392947';
    ctx.fillText('Confirmation Number:', width / 2, 980);
    ctx.font = `bold 40px ${FONT_FAMILY}`;
    ctx.fillStyle = '#009F56';
    ctx.fillText(identificationCode.toUpperCase(), width / 2, 1040);

    // Convert to blob and download
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `registration-confirmation-${identificationCode.toUpperCase()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      },
      'image/png',
      1.0,
    );
  } catch (error) {
    console.error('Error generating confirmation card:', error);
    throw error;
  }
};

export default PrintableConfirmationCard;
