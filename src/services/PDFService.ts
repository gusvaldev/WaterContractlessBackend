import PDFDocument from "pdfkit";
import path from "path";
import { Subdivision, Street, House, Report } from "../models/index.js";

const COLORS = {
  primary: "#1e40af",
  secondary: "#64748b",
  success: "#10b981",
  danger: "#ef4444",
  light: "#f1f5f9",
  text: "#1e293b",
  textLight: "#64748b",
};

const drawHeader = (
  doc: PDFKit.PDFDocument,
  subdivisionName?: string,
  showLogo: boolean = false
) => {
  // Solo mostrar títulos principales en la primera página (cuando showLogo = true)
  if (showLogo) {
    doc
      .fillColor(COLORS.primary)
      .fontSize(18)
      .font("Helvetica-Bold")
      .text(
        "Junta de Agua Potable y Alcantarillado del Municipio de Ahome",
        0,
        20,
        { align: "center", width: doc.page.width }
      );

    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .fillColor(COLORS.text)
      .text("Reporte de Tomas Directas", 0, 50, {
        align: "center",
        width: doc.page.width,
      });

    if (subdivisionName) {
      doc
        .fontSize(14)
        .fillColor(COLORS.text)
        .font("Helvetica")
        .text(`Fraccionamiento: ${subdivisionName}`, 0, 75, {
          align: "center",
          width: doc.page.width,
        });
    }

    doc.moveDown(subdivisionName ? 1 : 0.5);
    const logoPath = path.join(process.cwd(), "assets", "logoJapama.png");
    try {
      doc.image(logoPath, 50, doc.y, { width: 200 });
    } catch (error) {
      console.log("Logo no encontrado, continuando sin logo");
    }
    doc.moveDown(5); // Reducido de 8 a 2 para menos espacio después del logo
  } else {
    // En páginas siguientes, solo agregar un pequeño espacio superior
    doc.y = 50; // Margen superior simple
  }

  doc.fillColor(COLORS.text);
};

const drawInfoBox = (
  doc: PDFKit.PDFDocument,
  y: number,
  label: string,
  value: string
) => {
  doc
    .fontSize(10)
    .fillColor(COLORS.textLight)
    .font("Helvetica")
    .text(label, 50, y);
  doc
    .fontSize(11)
    .fillColor(COLORS.text)
    .font("Helvetica-Bold")
    .text(value, 200, y);
};

const drawSectionHeader = (doc: PDFKit.PDFDocument, title: string) => {
  if (doc.y > doc.page.height - 130) {
    doc.addPage();
    drawHeader(doc, undefined, false);
  }

  const y = doc.y;
  doc
    .fillColor(COLORS.primary)
    .rect(40, y - 5, doc.page.width - 80, 28)
    .fill();

  doc
    .fillColor("#ffffff")
    .fontSize(13)
    .font("Helvetica-Bold")
    .text(title, 50, y, { width: doc.page.width - 100 });

  doc.moveDown(0.8);
};

const drawHouseCard = (doc: PDFKit.PDFDocument, house: any) => {
  const reportCount = house.reports?.length || 0;
  const baseHeight = reportCount > 0 ? 70 : 55;
  const cardHeight = baseHeight + reportCount * 15;

  if (doc.y + cardHeight > doc.page.height - 70) {
    doc.addPage();
    drawHeader(doc, undefined, false); // Sin logo en páginas siguientes
  }

  const y = doc.y;

  doc
    .fillColor("#ffffff")
    .rect(50, y, doc.page.width - 100, cardHeight)
    .fill()
    .strokeColor(COLORS.light)
    .lineWidth(1)
    .rect(50, y, doc.page.width - 100, cardHeight)
    .stroke();

  doc
    .fillColor(COLORS.primary)
    .fontSize(12)
    .font("Helvetica-Bold")
    .text(`Casa #${house.house_number}`, 60, y + 10);

  const statusY = y + 32;
  const inhabitedIcon = house.inhabited === "1" ? "[Si]" : "[No]";
  const inhabitedColor =
    house.inhabited === "1" ? COLORS.success : COLORS.danger;
  const waterIcon = house.water === "1" ? "[Si]" : "[No]";
  const waterColor = house.water === "1" ? COLORS.success : COLORS.danger;

  doc.fontSize(9).fillColor(COLORS.textLight).text("Estado:", 60, statusY);

  doc
    .fillColor(inhabitedColor)
    .font("Helvetica-Bold")
    .text(inhabitedIcon, 110, statusY)
    .fillColor(COLORS.text)
    .font("Helvetica")
    .text(house.inhabited === "1" ? "Habitada" : "Deshabitada", 135, statusY);

  doc
    .fillColor(waterColor)
    .font("Helvetica-Bold")
    .text(waterIcon, 250, statusY)
    .fillColor(COLORS.text)
    .font("Helvetica")
    .text(house.water === "1" ? "Con agua" : "Sin agua", 275, statusY);

  if (house.reports && house.reports.length > 0) {
    doc
      .fontSize(9)
      .fillColor(COLORS.textLight)
      .font("Helvetica-Bold")
      .text("Historial de Reportes:", 60, statusY + 22);

    house.reports.forEach((report: any, index: number) => {
      const reportY = statusY + 37 + index * 15;
      const fecha = new Date(report.report_date).toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      doc
        .fillColor(COLORS.secondary)
        .fontSize(8)
        .font("Helvetica")
        .text("-", 70, reportY)
        .fillColor(COLORS.primary)
        .font("Helvetica-Bold")
        .text(fecha, 80, reportY)
        .fillColor(COLORS.text)
        .font("Helvetica")
        .text(report.comments || "Sin comentarios", 140, reportY, {
          width: doc.page.width - 180,
        });
    });
  } else {
    doc
      .fontSize(8)
      .fillColor(COLORS.textLight)
      .font("Helvetica-Oblique")
      .text("", 60, statusY + 22);
  }

  doc.y = y + cardHeight + 8;
};

export const generateSubdivisionPDF = async (subdivisionId: number) => {
  const subdivision = await Subdivision.findByPk(subdivisionId, {
    include: [
      {
        model: Street,
        as: "streets",
        include: [
          {
            model: House,
            as: "houses",
            include: [
              {
                model: Report,
                as: "reports",
                order: [["report_date", "DESC"]],
              },
            ],
          },
        ],
      },
    ],
  });

  if (!subdivision) {
    throw new Error("Subdivision not found");
  }

  const subdivisionData = subdivision.toJSON() as any;
  const doc = new PDFDocument({ margin: 50, size: "LETTER" });

  drawHeader(doc, subdivisionData.subdivision_name, true); // Logo solo primera página

  drawInfoBox(
    doc,
    doc.y,
    "Fecha de emisión:",
    new Date().toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  );
  doc.moveDown();

  const totalCasas = subdivisionData.streets.reduce(
    (sum: number, s: any) => sum + s.houses.length,
    0
  );

  drawInfoBox(doc, doc.y, "Total de casas:", totalCasas.toString());
  doc.moveDown(2);

  subdivisionData.streets.forEach((street: any, index: number) => {
    if (index > 0) {
      doc.moveDown(1.5);
    }

    drawSectionHeader(doc, `Calle: ${street.street_name}`);

    if (street.houses.length === 0) {
      doc
        .fontSize(10)
        .fillColor(COLORS.textLight)
        .font("Helvetica-Oblique")
        .text("Sin casas registradas en esta calle", 60, doc.y);
      doc.moveDown();
      return;
    }

    street.houses.forEach((house: any) => {
      drawHouseCard(doc, house);
    });
  });

  doc.on("pageAdded", () => {
    const pageCount = (doc as any).pageCount || 1;
    doc
      .fontSize(8)
      .fillColor(COLORS.textLight)
      .text(`Página ${pageCount}`, 50, doc.page.height - 50, {
        align: "center",
      });
  });

  return doc;
};

export const generateAllSubdivisionsPDF = async () => {
  const subdivisions = await Subdivision.findAll({
    include: [
      {
        model: Street,
        as: "streets",
        include: [
          {
            model: House,
            as: "houses",
            include: [
              {
                model: Report,
                as: "reports",
                order: [["report_date", "DESC"]],
              },
            ],
          },
        ],
      },
    ],
  });

  if (subdivisions.length === 0) {
    throw new Error("No subdivisions found");
  }

  const subdivisionsData = subdivisions.map((s) => s.toJSON()) as any[];
  const doc = new PDFDocument({ margin: 50, size: "LETTER" });

  drawHeader(doc, undefined, true); // Logo solo en primera página

  drawInfoBox(
    doc,
    doc.y,
    "Fecha de emisión:",
    new Date().toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  );
  doc.moveDown();

  const totalCasas = subdivisionsData.reduce(
    (sum: number, s: any) =>
      sum +
      s.streets.reduce(
        (streetSum: number, st: any) => streetSum + st.houses.length,
        0
      ),
    0
  );

  drawInfoBox(doc, doc.y, "Total de casas:", totalCasas.toString());
  doc.moveDown(2);

  subdivisionsData.forEach((subdivision: any, subdivIndex: number) => {
    // Crear nueva página para cada fraccionamiento (excepto el primero)
    if (subdivIndex > 0) {
      doc.addPage();
      drawHeader(doc, subdivision.subdivision_name, false); // Sin logo en páginas siguientes
    }

    // Mostrar nombre del fraccionamiento con diseño destacado
    const subdivisionY = doc.y;

    // Rectángulo de fondo más grande y con degradado visual
    doc
      .fillColor(COLORS.primary)
      .rect(40, subdivisionY - 8, doc.page.width - 80, 40)
      .fill();

    // Agregar una línea decorativa en la parte inferior
    doc
      .fillColor(COLORS.success)
      .rect(40, subdivisionY + 28, doc.page.width - 80, 4)
      .fill();

    // Texto del fraccionamiento en blanco y más grande
    doc
      .fillColor("#ffffff")
      .fontSize(16)
      .font("Helvetica-Bold")
      .text(
        subdivIndex === 0
          ? `${subdivision.subdivision_name}`
          : `Fraccionamiento: ${subdivision.subdivision_name}`,
        50,
        subdivisionY,
        { width: doc.page.width - 100 }
      );

    doc.moveDown(2);

    // Mostrar estadísticas del fraccionamiento
    const casas = subdivision.streets.reduce(
      (sum: number, st: any) => sum + st.houses.length,
      0
    );
    const habitadas = subdivision.streets.reduce(
      (sum: number, st: any) =>
        sum + st.houses.filter((h: any) => h.inhabited === "1").length,
      0
    );
    const conAgua = subdivision.streets.reduce(
      (sum: number, st: any) =>
        sum + st.houses.filter((h: any) => h.water === "1").length,
      0
    );

    drawInfoBox(doc, doc.y, "Total de casas:", casas.toString());
    doc.moveDown(0.5);

    const porcentajeHabitadas =
      casas > 0 ? Math.round((habitadas / casas) * 100) : 0;
    drawInfoBox(
      doc,
      doc.y,
      "Casas habitadas:",
      `${habitadas} (${porcentajeHabitadas}%)`
    );
    doc.moveDown(0.5);

    const porcentajeConAgua =
      casas > 0 ? Math.round((conAgua / casas) * 100) : 0;
    drawInfoBox(
      doc,
      doc.y,
      "Casas con agua:",
      `${conAgua} (${porcentajeConAgua}%)`
    );
    doc.moveDown(2);

    subdivision.streets.forEach((street: any, index: number) => {
      if (index > 0) {
        doc.moveDown(1.5);
      }

      drawSectionHeader(doc, `Calle: ${street.street_name}`);

      if (street.houses.length === 0) {
        doc
          .fontSize(10)
          .fillColor(COLORS.textLight)
          .font("Helvetica-Oblique")
          .text("Sin casas registradas en esta calle", 60, doc.y);
        doc.moveDown();
        return;
      }

      street.houses.forEach((house: any) => {
        drawHouseCard(doc, house);
      });
    });
  });

  doc.on("pageAdded", () => {
    const pageCount = (doc as any).pageCount || 1;
    doc
      .fontSize(8)
      .fillColor(COLORS.textLight)
      .text(`Página ${pageCount}`, 50, doc.page.height - 50, {
        align: "center",
      });
  });

  return doc;
};

export const generatePadronSubdivisionsPDF = async () => {
  const subdivisions = await Subdivision.findAll({
    include: [
      {
        model: Street,
        as: "streets",
        include: [
          {
            model: House,
            as: "houses",
          },
        ],
      },
    ],
  });

  if (subdivisions.length === 0) {
    throw new Error("No subdivisions found");
  }

  const subdivisionsData = subdivisions.map((s) => s.toJSON()) as any[];
  const doc = new PDFDocument({
    margin: 40,
    size: "LETTER",
    layout: "landscape",
  });

  // Título
  doc
    .fillColor(COLORS.primary)
    .fontSize(22)
    .font("Helvetica-Bold")
    .text(
      "Junta de Agua Potable y Alcantarillado del Municipio de Ahome",
      0,
      25,
      { align: "center", width: doc.page.width }
    );

  doc
    .fontSize(16)
    .font("Helvetica")
    .fillColor(COLORS.text)
    .text("Padrón de Fraccionamientos Nuevos", 0, 53, {
      align: "center",
      width: doc.page.width,
    });

  doc.moveDown(1);

  const logoPath = path.join(process.cwd(), "assets", "logoJapama.png");
  try {
    doc.image(logoPath, 40, doc.y, { width: 200 });
  } catch (error) {
    console.log("Logo no encontrado, continuando sin logo");
  }

  doc.moveDown(4);

  // Fecha
  doc
    .fontSize(9)
    .fillColor(COLORS.textLight)
    .font("Helvetica")
    .text(
      `Fecha: ${new Date().toLocaleDateString("es-MX", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}`,
      0,
      doc.y,
      { align: "right", width: doc.page.width - 40 }
    );

  doc.moveDown(1.5);

  const cols = {
    nombre: 50,
    totalTomas: 260,
    habitadasConAgua: 340,
    habitadasSinAgua: 440,
    deshabitadasConAgua: 540,
    deshabitadasSinAgua: 650,
  };

  const headerY = doc.y;
  doc
    .fontSize(9)
    .fillColor(COLORS.primary)
    .font("Helvetica-Bold")
    .text("Fraccionamiento", cols.nombre, headerY, { width: 200 })
    .text("Total", cols.totalTomas, headerY, { width: 70, align: "center" })
    .text("Hab. c/Agua", cols.habitadasConAgua, headerY, {
      width: 90,
      align: "center",
    })
    .text("Hab. s/Agua", cols.habitadasSinAgua, headerY, {
      width: 90,
      align: "center",
    })
    .text("Deshab. c/Agua", cols.deshabitadasConAgua, headerY, {
      width: 100,
      align: "center",
    })
    .text("Deshab. s/Agua", cols.deshabitadasSinAgua, headerY, {
      width: 100,
      align: "center",
    });

  doc.moveDown(0.8);

  // Línea divisoria después de encabezados
  doc
    .strokeColor(COLORS.primary)
    .lineWidth(1.5)
    .moveTo(cols.nombre, doc.y)
    .lineTo(doc.page.width - 50, doc.y)
    .stroke();

  doc.moveDown(0.5);

  // Recorrer cada fraccionamiento (formato de tabla)
  subdivisionsData.forEach((subdivision: any, index: number) => {
    // Calcular estadísticas
    const allHouses = subdivision.streets.reduce(
      (houses: any[], street: any) => [...houses, ...street.houses],
      []
    );

    const totalTomas = allHouses.length;
    const habitadasConAgua = allHouses.filter(
      (h: any) => h.inhabited === "1" && h.water === "1"
    ).length;
    const habitadasSinAgua = allHouses.filter(
      (h: any) => h.inhabited === "1" && h.water === "0"
    ).length;
    const deshabitadasConAgua = allHouses.filter(
      (h: any) => h.inhabited === "0" && h.water === "1"
    ).length;
    const deshabitadasSinAgua = allHouses.filter(
      (h: any) => h.inhabited === "0" && h.water === "0"
    ).length;

    // Verificar si necesitamos nueva página
    if (doc.y > doc.page.height - 60) {
      doc.addPage();
      doc.moveDown(1);
    }

    const rowY = doc.y;

    // Fondo alternado para mejor legibilidad
    if (index % 2 === 0) {
      doc
        .fillColor(COLORS.light)
        .rect(cols.nombre - 5, rowY - 3, doc.page.width - 90, 18)
        .fill();
    }

    // Datos de la fila
    doc
      .fontSize(9)
      .fillColor(COLORS.text)
      .font("Helvetica")
      .text(subdivision.subdivision_name, cols.nombre, rowY, { width: 200 })
      .font("Helvetica-Bold")
      .text(totalTomas.toString(), cols.totalTomas, rowY, {
        width: 70,
        align: "center",
      })
      .font("Helvetica")
      .text(habitadasConAgua.toString(), cols.habitadasConAgua, rowY, {
        width: 90,
        align: "center",
      })
      .text(habitadasSinAgua.toString(), cols.habitadasSinAgua, rowY, {
        width: 90,
        align: "center",
      })
      .text(deshabitadasConAgua.toString(), cols.deshabitadasConAgua, rowY, {
        width: 100,
        align: "center",
      })
      .text(deshabitadasSinAgua.toString(), cols.deshabitadasSinAgua, rowY, {
        width: 100,
        align: "center",
      });

    doc.moveDown(0.7);
  });

  return doc;
};
