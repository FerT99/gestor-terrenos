import jsPDF from 'jspdf';
import { type Abono } from './api';

export const generateReceipt = (abono: Abono) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5' // A5 is a good size for receipts
  });

  // Título / Cabecera
  doc.setFillColor(234, 88, 12); // #ea580c (Tailwind orange-600)
  doc.rect(0, 0, 148, 20, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('RECIBO DE PAGO', 15, 13, { align: 'left' });

  // "Logo" LOTERRA
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('LOTERRA', 133, 13, { align: 'right' });

  // Datos del Emisor y Folio
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Emisor:', 15, 35);
  doc.setFont('helvetica', 'normal');
  doc.text('Javier Barajas', 35, 35);
  
  doc.setFont('helvetica', 'bold');
  const folioStr = abono.numero_abono ? String(abono.numero_abono).padStart(4, '0') : String(abono.id).slice(0, 4);
  doc.text(`Folio: #A-${folioStr}`, 133, 35, { align: 'right' });

  const currentDate = new Date();
  const dateStr = currentDate.toLocaleDateString('es-MX', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  doc.text(`Fecha: ${dateStr}`, 133, 42, { align: 'right' });

  // Línea divisoria
  doc.setDrawColor(200, 200, 200);
  doc.line(15, 50, 133, 50);

  // Datos del Cliente
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Recibí de:', 15, 60);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(abono.cliente_nombre || 'Cliente no especificado', 15, 66);

  // Concepto
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Concepto:', 15, 80);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Abono a terreno/lote: ${abono.terreno_clave || '---'}`, 15, 86);

  // Detalles financieros
  doc.setFillColor(245, 245, 245);
  doc.rect(15, 100, 118, 40, 'F');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Monto Recibido:', 20, 110);
  doc.setFontSize(14);
  doc.setTextColor(234, 88, 12);
  doc.text(`$${abono.monto_pagado.toLocaleString('es-MX', {minimumFractionDigits: 2})} ${abono.moneda || 'MXN'}`, 20, 118);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Método de Pago:', 20, 130);
  doc.setFont('helvetica', 'normal');
  doc.text(abono.metodo_pago || 'No especificado', 55, 130);

  if (abono.tipo_cambio) {
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`* Tipo de cambio aplicado: 1 USD = $${abono.tipo_cambio} MXN`, 20, 136);
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Documento generado automáticamente por Gestor de Terrenos', 74, 200, { align: 'center' });

  // Descargar
  doc.save(`Recibo_Lote_${abono.terreno_clave || 'X'}_${dateStr.replace(/ /g, '_')}.pdf`);
};
