import PDFDocument from "pdfkit";
import { Subdivision, Street, House, Report } from "../models";

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

  const doc = new PDFDocument({ margin: 50 });

  doc
    .fontSize(18)
    .text("Reporte de Tomas Directas en Fraccionamientos", { align: "center" });
  doc.moveDown();
  doc.fontSize(14).text(`Fraccionamiento: ${subdivisionData.subdivision_name}`);
  doc.fontSize(10).text(
    `Fecha: ${new Date().toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`
  );
  doc.moveDown();

  subdivisionData.streets.forEach((street: any) => {
    doc.fontSize(12).fillColor("black").text(`Calle: ${street.street_name}`, {
      underline: true,
    });
    doc.moveDown(0.5);

    if (street.houses.length === 0) {
      doc.fontSize(9).fillColor("gray").text("  Sin casas registradas");
      doc.moveDown();
      return;
    }

    street.houses.forEach((house: any) => {
      doc.fontSize(10).fillColor("black").text(`  Casa #${house.house_number}`);
      doc
        .fontSize(9)
        .text(`    Habitada: ${house.inhabited === "1" ? "Sí" : "No"}`)
        .text(`    Agua: ${house.water === "1" ? "Sí" : "No"}`);

      if (house.reports && house.reports.length > 0) {
        doc.fontSize(9).text("    Reportes:");
        house.reports.forEach((report: any) => {
          const fecha = new Date(report.report_date).toLocaleDateString(
            "es-MX"
          );
          doc
            .fontSize(8)
            .text(`      • ${fecha}: ${report.comments || "Sin comentarios"}`);
        });
      } else {
        doc.fontSize(8).fillColor("gray").text("    Sin reportes");
      }

      doc.moveDown(0.5);
    });

    doc.moveDown();
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

  const doc = new PDFDocument({ margin: 50 });

  doc
    .fontSize(18)
    .text("Reporte de Tomas Directas en Fraccionamientos", { align: "center" });
  doc.moveDown();
  doc.fontSize(10).text(
    `Fecha: ${new Date().toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`
  );
  doc.moveDown();
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown();

  subdivisionsData.forEach((subdivision: any, subdivIndex: number) => {
    doc
      .fontSize(14)
      .fillColor("black")
      .text(`Fraccionamiento: ${subdivision.subdivision_name}`, {
        underline: true,
      });
    doc.moveDown(0.5);

    subdivision.streets.forEach((street: any) => {
      doc.fontSize(12).text(`  Calle: ${street.street_name}`);
      doc.moveDown(0.3);

      if (street.houses.length === 0) {
        doc.fontSize(9).fillColor("gray").text("    Sin casas registradas");
        doc.moveDown();
        return;
      }

      street.houses.forEach((house: any) => {
        doc
          .fontSize(10)
          .fillColor("black")
          .text(`    Casa #${house.house_number}`);
        doc
          .fontSize(9)
          .text(`      Habitada: ${house.inhabited === "1" ? "Sí" : "No"}`)
          .text(`      Agua: ${house.water === "1" ? "Sí" : "No"}`);

        if (house.reports && house.reports.length > 0) {
          doc.fontSize(9).text("      Reportes:");
          house.reports.forEach((report: any) => {
            const fecha = new Date(report.report_date).toLocaleDateString(
              "es-MX"
            );
            doc
              .fontSize(8)
              .text(
                `        • ${fecha}: ${report.comments || "Sin comentarios"}`
              );
          });
        } else {
          doc.fontSize(8).fillColor("gray").text("      Sin reportes");
        }

        doc.moveDown(0.4);
      });

      doc.moveDown(0.5);
    });

    if (subdivIndex < subdivisionsData.length - 1) {
      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor("#cccccc").stroke();
      doc.moveDown();
    }
  });

  return doc;
};
