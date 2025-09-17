import jsPDF from 'jspdf';

// Configuración por defecto de la empresa (fallback)
const DEFAULT_EMPRESA_CONFIG = {
  nombre: 'Gutiérrez Hnos',
  direccion: 'San Martín, Chaco, Argentina',
  cuit: '20-12345678-9',
  telefono: '+54 9 11 1234-5678',
  email: 'info@gutierrezhnos.com'
};

// Función para generar PDF de factura
export const generarPDFFactura = (factura, datosTransaccion, empresaConfig = {}) => {
  const doc = new jsPDF();
  
  // Configuración del documento
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  let yPosition = margin;
  
  // Función para agregar texto con wrap
  const addText = (text, x, y, options = {}) => {
    const { fontSize = 10, fontStyle = 'normal', color = '#000000', align = 'left' } = options;
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    doc.setTextColor(color);
    doc.text(text, x, y, { align });
  };
  
  // Función para agregar línea
  const addLine = (x1, y1, x2, y2, color = '#000000', width = 0.5) => {
    doc.setDrawColor(color);
    doc.setLineWidth(width);
    doc.line(x1, y1, x2, y2);
  };
  
  // Merge de configuración: empresa (desde Configuración) con defaults
  const EMPRESA = { ...DEFAULT_EMPRESA_CONFIG, ...empresaConfig };

  // Header de la empresa
  addText(EMPRESA.nombre, margin, yPosition, { fontSize: 18, fontStyle: 'bold' });
  yPosition += 8;
  
  addText(EMPRESA.direccion, margin, yPosition, { fontSize: 10 });
  yPosition += 5;
  
  addText(`CUIT: ${EMPRESA.cuit}`, margin, yPosition, { fontSize: 10 });
  yPosition += 5;
  
  addText(`Tel: ${EMPRESA.telefono} | Email: ${EMPRESA.email}`, margin, yPosition, { fontSize: 10 });
  yPosition += 15;
  
  // Línea separadora
  addLine(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;
  
  // Título del comprobante
  const tipoComprobante = getTipoComprobanteLabel(factura.tipo_comprobante);
  addText(tipoComprobante, margin, yPosition, { fontSize: 16, fontStyle: 'bold' });
  yPosition += 8;
  
  // Número de factura
  addText(`Número: ${factura.numero_factura}`, margin, yPosition, { fontSize: 12, fontStyle: 'bold' });
  yPosition += 6;
  
  // Fechas
  addText(`Fecha de Emisión: ${formatearFecha(factura.fecha_emision)}`, margin, yPosition, { fontSize: 10 });
  yPosition += 5;
  
  if (factura.fecha_vencimiento) {
    addText(`Fecha de Vencimiento: ${formatearFecha(factura.fecha_vencimiento)}`, margin, yPosition, { fontSize: 10 });
    yPosition += 5;
  }
  
  yPosition += 10;
  
  // Información del cliente/proveedor
  const clienteProveedor = datosTransaccion.clienteProveedor;
  addText('Datos del Cliente/Proveedor:', margin, yPosition, { fontSize: 12, fontStyle: 'bold' });
  yPosition += 6;
  
  addText(`Nombre: ${clienteProveedor.nombre}`, margin, yPosition, { fontSize: 10 });
  yPosition += 5;
  
  if (clienteProveedor.cuit) {
    addText(`CUIT: ${clienteProveedor.cuit}`, margin, yPosition, { fontSize: 10 });
    yPosition += 5;
  }
  
  yPosition += 10;
  
  // Detalles de la transacción
  addText('Detalles de la Transacción:', margin, yPosition, { fontSize: 12, fontStyle: 'bold' });
  yPosition += 6;
  
  // Tabla de detalles
  const tableData = [
    ['Concepto', 'Cantidad', 'Precio Unit.', 'Total']
  ];
  
  if (datosTransaccion.detalles) {
    datosTransaccion.detalles.forEach(detalle => {
      tableData.push([
        detalle.concepto,
        detalle.cantidad.toString(),
        `$${detalle.precioUnitario.toLocaleString('es-AR')}`,
        `$${detalle.total.toLocaleString('es-AR')}`
      ]);
    });
  } else {
    // Detalle simple
    tableData.push([
      datosTransaccion.concepto || 'Servicio',
      '1',
      `$${factura.monto_neto.toLocaleString('es-AR')}`,
      `$${factura.monto_neto.toLocaleString('es-AR')}`
    ]);
  }
  
  // Dibujar tabla
  const tableTop = yPosition;
  const rowHeight = 8;
  const colWidths = [80, 30, 40, 40];
  let currentX = margin;
  
  tableData.forEach((row, rowIndex) => {
    currentX = margin;
    row.forEach((cell, colIndex) => {
      const cellWidth = colWidths[colIndex];
      
      // Dibujar borde de la celda
      doc.rect(currentX, yPosition - 4, cellWidth, rowHeight);
      
      // Agregar texto de la celda
      const isHeader = rowIndex === 0;
      addText(cell, currentX + 2, yPosition, { 
        fontSize: isHeader ? 10 : 9, 
        fontStyle: isHeader ? 'bold' : 'normal' 
      });
      
      currentX += cellWidth;
    });
    yPosition += rowHeight;
  });
  
  yPosition += 10;
  
  // Totales
  const totalX = pageWidth - margin - 100;
  
  addText('Subtotal:', totalX, yPosition, { fontSize: 10 });
  addText(`$${factura.monto_neto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, pageWidth - margin, yPosition, { fontSize: 10, align: 'right' });
  yPosition += 5;
  
  if (factura.iva_total > 0) {
    addText('IVA (21%):', totalX, yPosition, { fontSize: 10 });
    addText(`$${factura.iva_total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, pageWidth - margin, yPosition, { fontSize: 10, align: 'right' });
    yPosition += 5;
  }
  
  // Línea separadora para el total
  addLine(totalX, yPosition, pageWidth - margin, yPosition);
  yPosition += 5;
  
  addText('TOTAL:', totalX, yPosition, { fontSize: 12, fontStyle: 'bold' });
  addText(`$${factura.monto_total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, pageWidth - margin, yPosition, { fontSize: 12, fontStyle: 'bold', align: 'right' });
  yPosition += 15;
  
  // Observaciones
  if (factura.observaciones) {
    addText('Observaciones:', margin, yPosition, { fontSize: 10, fontStyle: 'bold' });
    yPosition += 5;
    
    // Dividir texto largo en múltiples líneas
    const maxWidth = contentWidth;
    const lines = doc.splitTextToSize(factura.observaciones, maxWidth);
    lines.forEach(line => {
      addText(line, margin, yPosition, { fontSize: 9 });
      yPosition += 4;
    });
    yPosition += 10;
  }
  
  // Footer
  yPosition = pageHeight - 30;
  addLine(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 5;
  
  addText('Gracias por su confianza', margin, yPosition, { fontSize: 10, align: 'center' });
  addText(`Generado el ${new Date().toLocaleString('es-AR')}`, margin, yPosition + 5, { fontSize: 8, align: 'center' });
  
  return doc;
};

// Función para descargar PDF
export const descargarPDFFactura = (factura, datosTransaccion, empresaConfig = {}) => {
  const doc = generarPDFFactura(factura, datosTransaccion, empresaConfig);
  const fileName = `factura_${factura.numero_factura}.pdf`;
  doc.save(fileName);
};

// Función para abrir PDF en nueva ventana
export const abrirPDFFactura = (factura, datosTransaccion, empresaConfig = {}) => {
  const doc = generarPDFFactura(factura, datosTransaccion, empresaConfig);
  const pdfDataUri = doc.output('datauristring');
  window.open(pdfDataUri, '_blank');
};

// Función para obtener Data URI del PDF (para previsualización en iframe)
export const generarFacturaDataUri = (factura, datosTransaccion, empresaConfig = {}) => {
  const doc = generarPDFFactura(factura, datosTransaccion, empresaConfig);
  return doc.output('datauristring');
};

// Funciones auxiliares
const getTipoComprobanteLabel = (tipo) => {
  const tipos = {
    'A': 'Factura A',
    'B': 'Factura B', 
    'C': 'Factura C',
    'E': 'Factura E'
  };
  return tipos[tipo] || 'Comprobante';
};

const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Función para generar datos de transacción desde venta
export const generarDatosVenta = (venta) => {
  return {
    clienteProveedor: {
      nombre: venta.compradores?.nombre || 'Sin especificar',
      cuit: venta.compradores?.cuit || ''
    },
    concepto: `Venta de animales - ${venta.tipo}`,
    detalles: [
      {
        concepto: `Animales (${venta.total_animales || 0} unidades)`,
        cantidad: venta.total_animales || 0,
        precioUnitario: venta.precio_kilo || 0,
        total: venta.valor_total || venta.precio_total || 0
      }
    ]
  };
};

// Función para generar datos de transacción desde compra
export const generarDatosCompra = (compra) => {
  return {
    clienteProveedor: {
      nombre: compra.proveedores?.nombre || 'Sin especificar',
      cuit: compra.proveedores?.cuit || ''
    },
    concepto: `Compra de animales`,
    detalles: [
      {
        concepto: 'Compra de animales',
        cantidad: 1,
        precioUnitario: compra.precio_total || 0,
        total: compra.precio_total || 0
      }
    ]
  };
};
