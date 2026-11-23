import { toPng } from 'html-to-image';

export const downloadTicketAsPng = async (elementId, filename = 'SSF-PUTHUR-TICKET.png') => {
  const node = document.getElementById(elementId);
  if (!node) {
    throw new Error(`Element #${elementId} not found`);
  }

  try {
    const dataUrl = await toPng(node, {
      quality: 0.98,
      pixelRatio: 2.5,
      cacheBust: true,
      backgroundColor: '#ffffff',
    });

    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
    return true;
  } catch (error) {
    console.warn('html-to-image failed, falling back to window.print', error);
    window.print();
    return false;
  }
};

export const printTicket = () => {
  window.print();
};
