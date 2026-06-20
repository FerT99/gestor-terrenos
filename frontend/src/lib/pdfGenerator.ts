import jsPDF from 'jspdf';
import { type Abono, api } from './api';
import { formatoMonedaLetras } from './numeroALetras';

export const generateReceipt = async (abono: Abono) => {
  // Try to fetch additional data needed for the exact format
  let precioLista = 0;
  let saldoFinal = 0;
  
  try {
    // We need to fetch the plan and terreno if possible to get exact numbers.
    // If not, we will just use placeholders or 0.
    const [planes, terrenos] = await Promise.all([
      api.planesPago.getAll(),
      api.terrenos.getAll()
    ]);
    
    // We try to find the plan associated with this terreno
    // Since Abono has terreno_clave, let's find the terreno
    const terreno = terrenos.find(t => t.clave === abono.terreno_clave);
    if (terreno) {
      precioLista = terreno.precio_lista;
      const plan = planes.find(p => p.terreno_id === terreno.id);
      if (plan) {
        // approximate saldo final (this might need exact calculation from all abonos, but we do an approximation)
        // ideally, we should fetch all abonos for this plan.
        saldoFinal = Math.max(0, plan.monto_total - plan.enganche - abono.monto_pagado); // simplified
      }
    }
  } catch (error) {
    console.warn("Could not fetch extra info for receipt", error);
  }

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "letter"
  });

  const width = doc.internal.pageSize.getWidth();
  const margin = 15;

  // Logo / Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("AMPLIACION EJ. PIEDRAS NEGRAS", margin, 25);

  // Logo Text
  doc.setFontSize(16);
  doc.text("ENCANTO", width - margin - 40, 20);
  doc.setFontSize(10);
  doc.text("- TECOLOTES -", width - margin - 40, 25);
  
  // Draw outer borders
  doc.setLineWidth(0.5);
  doc.rect(margin, 30, width - (margin * 2), 35);

  // Section 1: LUGAR Y FECHA, VENDEDOR, COMPRADOR
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  
  const abonoDate = new Date(abono.fecha_pago);
  const fecha = abonoDate.toLocaleDateString('es-MX', {
      year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
  });
  
  doc.text(`LUGAR Y FECHA: Ej. Piedras Negras, B.C., a ${fecha}`, margin + 5, 40);
  doc.text("NOMBRE DEL VENDEDOR: JOAQUIN VALDIVIA GASTELUM", margin + 5, 50);
  doc.text(`NOMBRE DEL COMPRADOR: ${abono.cliente_nombre?.toUpperCase() || ''}`, margin + 5, 60);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("WHATSAPP", width - margin - 40, 45);
  doc.text("(686) 247 4285", width - margin - 45, 52);

  // Section 2: Details Box
  doc.rect(margin, 68, width - (margin * 2), 48);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const abonoStr = abono.numero_abono ? abono.numero_abono.toString() : 'Enganche';
  doc.text(`NUMERO DE ABONO: ${abonoStr}`, margin + 5, 76);
  doc.text(`DESCRIPCIÓN DEL LOTE: Lote Número: ${abono.terreno_clave || ''}`, margin + 5, 84);
  doc.text(`DETALLES DE LOS LOTES: ${abono.terreno_nombre || ''}`, margin + 5, 92);

  const montoEnLetras = formatoMonedaLetras(Number(abono.monto_pagado));
  const montoFormateado = Number(abono.monto_pagado).toLocaleString('es-MX', {style: 'currency', currency: 'MXN'});
  
  const precioTotalLetras = precioLista > 0 ? formatoMonedaLetras(precioLista) : '_____________________';
  const precioTotalFormateado = precioLista > 0 ? precioLista.toLocaleString('es-MX', {style: 'currency', currency: 'MXN'}) : '_____________';

  // For exact saldo final we might need to rely on what we can display
  const restanteText = saldoFinal > 0 ? saldoFinal.toLocaleString('es-MX', {style: 'currency', currency: 'MXN'}) : '_____________';

  const textoCantidad = `CANTIDAD RECIBIDA: El vendedor, JOAQUIN VALDIVIA GASTELUM, recibe en este acto la cantidad de ${montoEnLetras} (${montoFormateado}) por parte del comprador ${abono.cliente_nombre?.toUpperCase() || '______________'}, como pago del lote #${abono.terreno_clave || '____'} descrito anteriormente con un valor total de ${precioTotalFormateado} (${precioTotalLetras}), quedando como costo final ${restanteText}.`;

  const splitText = doc.splitTextToSize(textoCantidad, width - (margin * 2) - 10);
  doc.text(splitText, margin + 5, 102);

  // CONDICIONES
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("CONDICIONES:", width / 2, 125, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.text("Este recibo acredita la recepción del pago del lote mencionado.", width / 2, 130, { align: "center" });
  doc.text("El presente documento no constituye un contrato de compraventa definitivo. Este será formalizado por ambas partes posteriormente, de acuerdo con los términos establecidos.", width / 2, 135, { align: "center" });

  // FIRMAS
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("FIRMAS", width / 2, 145, { align: "center" });

  doc.setFont("helvetica", "normal");
  
  // Lineas de firma
  const lineY1 = 165;
  const lineY2 = 195;

  // Vendedor
  doc.line(margin + 20, lineY1, margin + 100, lineY1);
  doc.text("VENDEDOR", margin + 60, lineY1 + 5, { align: "center" });

  // Comprador
  doc.line(width - margin - 100, lineY1, width - margin - 20, lineY1);
  doc.text("COMPRADOR", width - margin - 60, lineY1 + 5, { align: "center" });

  // Testigos
  doc.line(margin + 20, lineY2, margin + 100, lineY2);
  doc.text("TESTIGO", margin + 60, lineY2 + 5, { align: "center" });

  doc.line(width - margin - 100, lineY2, width - margin - 20, lineY2);
  doc.text("TESTIGO", width - margin - 60, lineY2 + 5, { align: "center" });

  // Save
  doc.save(`Recibo_Abono_${abonoStr}_Lote_${abono.terreno_clave || 'X'}.pdf`);
};
