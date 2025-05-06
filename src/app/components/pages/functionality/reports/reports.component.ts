import { ReportModalComponent } from './report-modal/report-modal.component';
import { ReportService } from "../../../../services/report.service";
import { RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReportViewerModalComponent } from './report-viewer-modal/report-viewer-modal.component';
import Swal from "sweetalert2";
import {
  ReportDto,
  ReportWorkshopDto,
  ReportWithWorkshopsDto
} from "../../../../interfaces/report.interface";
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';


@Component({
  selector: "app-reports",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, ReportViewerModalComponent, ReportModalComponent],
  templateUrl: "./reports.component.html",
  styleUrls: ["./reports.component.css"],
})
export class ReportsComponent implements OnInit {
  descriptionHtml: SafeHtml = '';
  showDescriptionModal = false;

  // Datos
  reports: (ReportDto | ReportWithWorkshopsDto)[] = [];
  filteredReports: (ReportDto | ReportWithWorkshopsDto)[] = [];
  pagedReports: (ReportDto | ReportWithWorkshopsDto)[] = [];

  // Filtros
  selectedTrimester = ""
  selectedYear = ""
  workshopDateStart = ""
  workshopDateEnd = ""
  activeFilter: "active" | "inactive" = "active"

  // Paginación
  currentPage = 1
  pageSize = 5
  totalPages = 1

  // Lista de años para el selector
  years: number[] = []

  // Utilidad matemática para el template
  Math = Math

  // Control del formulario modal
  showReportForm = false
  showReportViewer = false
  selectedReport: ReportDto | ReportWithWorkshopsDto | null = null;
  isLoading = false

  // Control del visor de imágenes
  showImageViewer = false
  currentImages: string[] = []
  currentImageIndex = 0

  // Control del visor de talleres
  showWorkshopViewer = false
  currentWorkshops: ReportWorkshopDto[] = [];
  currentWorkshopIndex = 0
  loadingWorkshops = false

  constructor(private reportService: ReportService, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.isLoading = true;
    this.reportService.listReportsByFilter().subscribe(
      (data) => {
        this.reports = data;
        this.extractYearsFromReports();
        this.filterReports();
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        Swal.fire({ title: "Error", text: "No se pudieron cargar los reportes", icon: "error" });
      }
    );
  }

  getPlainTextFromHtml(html: string, maxLength: number = 100): string {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html || '';
    const text = tempDiv.textContent || tempDiv.innerText || '';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  }


  openDescriptionModal(html: string): void {
    this.descriptionHtml = this.sanitizer.bypassSecurityTrustHtml(html);
    this.showDescriptionModal = true;
  }

  closeDescriptionModal(): void {
    this.showDescriptionModal = false;
  }

  extractYearsFromReports(): void {
    const uniqueYears = new Set<number>();

    this.reports.forEach(reportData => {
      const year = 'year' in reportData
        ? reportData.year
        : 'report' in reportData
          ? reportData.report.year
          : undefined;

      if (year) uniqueYears.add(year);
    });

    this.years = Array.from(uniqueYears).sort((a, b) => b - a);
  }

  filterReports(): void {
    this.isLoading = true;
    const activeValue = this.activeFilter === "active" ? "A" : "I";
    const yearValue = this.selectedYear ? Number(this.selectedYear) : undefined;

    this.reportService.listReportsByFilter(this.selectedTrimester, activeValue, yearValue, this.workshopDateStart, this.workshopDateEnd)
      .subscribe(
        (data) => {
          this.filteredReports = data;
          this.totalPages = Math.ceil(this.filteredReports.length / this.pageSize);
          this.currentPage = 1;
          this.updatePagedReports();
          this.isLoading = false;
        },
        (error) => {
          this.isLoading = false;
          Swal.fire({ title: "Error", text: "No se pudieron filtrar los reportes", icon: "error" });
        }
      );
  }

  updatePagedReports(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedReports = this.filteredReports.slice(startIndex, endIndex);
  }

  clearAllFilters(): void {
    this.selectedTrimester = "";
    this.selectedYear = "";
    this.workshopDateStart = "";
    this.workshopDateEnd = "";
    this.activeFilter = "active";
    this.loadReports();
  }

  // Métodos de paginación
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--
      this.updatePagedReports()
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++
      this.updatePagedReports()
    }
  }

  goToPage(page: number): void {
    this.currentPage = page
    this.updatePagedReports()
  }

  getPageNumbers(): number[] {
    const pageNumbers: number[] = []
    const maxVisiblePages = 5

    if (this.totalPages <= maxVisiblePages) {
      // Mostrar todas las páginas si hay menos de maxVisiblePages
      for (let i = 1; i <= this.totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // Lógica para mostrar un número limitado de páginas con la actual en el centro
      let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2))
      let endPage = startPage + maxVisiblePages - 1

      if (endPage > this.totalPages) {
        endPage = this.totalPages
        startPage = Math.max(1, endPage - maxVisiblePages + 1)
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i)
      }
    }

    return pageNumbers
  }

  // Métodos para los filtros
  setActiveFilter(filter: "active" | "inactive"): void {
    this.activeFilter = filter
    this.filterReports()
  }

  refreshReports(): void {
    // Aplicar los filtros actuales
    this.filterReports()
  }

  // Acciones de reporte
  viewReport(reportData: ReportDto | ReportWithWorkshopsDto): void {
    this.isLoading = true;
    const reportId = 'report' in reportData ? reportData.report.id : reportData.id;

    this.reportService.getReportByIdWithDateFilter(reportId, this.workshopDateStart, this.workshopDateEnd).subscribe(
      (detailedReport: ReportWithWorkshopsDto) => {
        this.selectedReport = detailedReport;
        this.showReportViewer = true;
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        Swal.fire({ title: "Error", text: "No se pudieron cargar los detalles del reporte", icon: "error" });
      }
    );
  }

  // Agregar este método para cerrar el visor
  closeReportViewer()
    : void {
    this.showReportViewer = false
    this.selectedReport = null
  }


  editReport(reportData: ReportDto | ReportWithWorkshopsDto): void {
    this.isLoading = true;
    const reportId = 'report' in reportData ? reportData.report.id : reportData.id;

    Swal.fire({
      title: "Cargando datos",
      text: "Por favor espere...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.reportService.getReportByIdWithDateFilter(reportId, this.workshopDateStart, this.workshopDateEnd).subscribe(
      (detailedReport: ReportWithWorkshopsDto) => {
        this.selectedReport = detailedReport;
        this.showReportForm = true;
        this.isLoading = false;
        Swal.close();
      },
      (error) => {
        this.isLoading = false;
        Swal.fire({ title: "Error", text: "No se pudieron cargar los detalles del reporte", icon: "error" });
      }
    );
  }

  createReport(): void {
    this.selectedReport = null
    this.showReportForm = true
  }

  closeReportForm(): void {
    this.showReportForm = false
    this.selectedReport = null
  }

  onReportSaved(report: ReportWithWorkshopsDto): void {
    Swal.fire({
      title: "Éxito",
      text: "El reporte ha sido guardado correctamente",
      icon: "success",
      confirmButtonText: "Aceptar",
    });
    this.filterReports();
  }

  deleteReport(reportData: ReportDto | ReportWithWorkshopsDto): void {
    const report = 'report' in reportData ? reportData.report : reportData;

    Swal.fire({
      title: "¿Estás seguro?",
      text: `¿Deseas eliminar el reporte del ${report.trimester} ${report.year}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.reportService.deleteReport(report.id).subscribe(
          () => {
            this.isLoading = false;
            Swal.fire("¡Eliminado!", "El reporte ha sido eliminado correctamente.", "success");
            this.filterReports();
          },
          (error) => {
            this.isLoading = false;
            Swal.fire("Error", "No se pudo eliminar el reporte.", "error");
          }
        );
      }
    });
  }

  restoreReport(reportData: any): void {
    const report = reportData.report || reportData

    Swal.fire({
      title: "¿Estás seguro?",
      text: `¿Deseas restaurar el reporte del ${report.trimester} ${report.year}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, restaurar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true
        this.reportService.restoreReport(report.id).subscribe(
          () => {
            this.isLoading = false
            Swal.fire("¡Restaurado!", "El reporte ha sido restaurado correctamente.", "success")
            // Recargar reportes con los filtros actuales
            this.filterReports()
          },
          (error) => {
            this.isLoading = false
            Swal.fire("Error", "No se pudo restaurar el reporte.", "error")
          },
        )
      }
    })
  }

  downloadPdf(reportData: any): void {
    const reportId = 'report' in reportData ? reportData.report.id : reportData.id;

    Swal.fire({
      title: 'Generando PDF...',
      text: 'Por favor espera un momento',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.reportService.downloadReportPdf(reportId, this.workshopDateStart, this.workshopDateEnd).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.download = `reporte_${reportId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);

        Swal.close(); // Cerrar Swal exitosamente
      },
      error: (error) => {
        Swal.fire('Error', 'No se pudo generar el PDF.', 'error');
      }
    });
  }

  // Métodos para el visor de imágenes
  viewWorkshopImages(workshops: any): void {

    if (workshops.imageUrl && workshops.imageUrl.length > 0) {
      this.currentImages = workshops.imageUrl.map((url: string) => {
        // Convertir base64 o URL a formato visualizable
        if (url.startsWith("http")) {
          return url
        } else if (url.startsWith("data:image")) {
          return url
        } else if (url.startsWith("iVBOR") || url.startsWith("ASUN") || url.includes("/9j/") || url.includes("+/9k=")) {
          return `data:image/png;base64,${url}`
        } else {
          return "/assets/placeholder-image.png"
        }
      })

      this.currentImageIndex = 0
      this.showImageViewer = true
    } else {
      Swal.fire({
        title: "Información",
        text: "Este taller no tiene imágenes",
        icon: "info",
        confirmButtonText: "Aceptar",
      })
    }
  }

  // Método para ver los talleres de un reporte
  viewWorkshops(reportData: any): void {
    const reportId = reportData.report ? reportData.report.id : reportData.id;

    Swal.fire({
      title: "Cargando talleres",
      text: "Por favor espere...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.loadingWorkshops = true;

    // 👉 Usar filtros de fecha
    this.reportService.getReportByIdWithDateFilter(reportId, this.workshopDateStart, this.workshopDateEnd).subscribe(
      (detailedReport) => {
        this.processWorkshopsFromReport(detailedReport);
      },
      (error) => {
        this.handleWorkshopLoadError(error);
      }
    );
  }


  // Método para cargar los talleres con sus imágenes
  loadWorkshopsWithImages(workshops: any[]): void {
    // Primero, obtener el reporte detallado para asegurarnos de tener los datos completos
    const reportId = workshops[0].reportId;

    // Usar el nuevo método con filtros de fecha si están presentes
    this.reportService.getReportByIdWithDateFilter(reportId, this.workshopDateStart, this.workshopDateEnd).subscribe(
      (detailedReport) => {
        this.processWorkshopsFromReport(detailedReport);
      },
      (error) => {
        this.handleWorkshopLoadError(error);
      }
    );
  }


  // Método auxiliar para procesar los talleres de un reporte
  private processWorkshopsFromReport(detailedReport: any): void {
    // Extraer los talleres con imágenes del reporte detallado
    let detailedWorkshops = []

    if (detailedReport.workshops && Array.isArray(detailedReport.workshops)) {
      detailedWorkshops = detailedReport.workshops
    } else if (
      detailedReport.report &&
      detailedReport.report.workshops &&
      Array.isArray(detailedReport.report.workshops)
    ) {
      detailedWorkshops = detailedReport.report.workshops
    }

    // Actualizar los talleres con los datos detallados
    this.currentWorkshops = detailedWorkshops
    this.currentWorkshopIndex = 0
    this.showWorkshopViewer = true
    this.loadingWorkshops = false
    Swal.close()
  }

  // Método auxiliar para manejar errores al cargar talleres
  private handleWorkshopLoadError(error: any): void {
    this.loadingWorkshops = false
    Swal.fire({
      title: "Error",
      text: "No se pudieron cargar los detalles de los talleres",
      icon: "error",
      confirmButtonText: "Aceptar",
    })
  }

  // Método auxiliar para filtrar talleres por fecha (util para visualización local si es necesario)
  filterWorkshopsByDate(workshops: any[]): any[] {
    if (!workshops || workshops.length === 0) {
      return []
    }

    return workshops.filter((workshops) => {
      const workshopStartDate = new Date(workshops.workshopDateStart)
      const workshopEndDate = new Date(workshops.workshopDateEnd)

      // Convertir las fechas de filtro a objetos Date
      const filterStartDate = this.workshopDateStart ? new Date(this.workshopDateStart) : null
      const filterEndDate = this.workshopDateEnd ? new Date(this.workshopDateEnd) : null

      // Caso 1: Solo fecha de inicio especificada
      if (filterStartDate && !filterEndDate) {
        // Mostrar talleres que comienzan en o después de la fecha de inicio
        return workshopStartDate >= filterStartDate
      }
      // Caso 2: Solo fecha de fin especificada
      else if (!filterStartDate && filterEndDate) {
        // Mostrar talleres que terminan en o antes de la fecha de fin
        return workshopEndDate <= filterEndDate
      }
      // Caso 3: Ambas fechas especificadas
      else if (filterStartDate && filterEndDate) {
        // Mostrar talleres que caen dentro del rango de fechas
        return (
          (workshopStartDate >= filterStartDate && workshopStartDate <= filterEndDate) ||
          (workshopEndDate >= filterStartDate && workshopEndDate <= filterEndDate) ||
          (workshopStartDate <= filterStartDate && workshopEndDate >= filterEndDate)
        )
      }

      // Si no hay filtros de fecha, incluir todos los talleres
      return true
    })
  }

  // Método para ver las imágenes directamente desde el modal de talleres
  viewCurrentWorkshopImages(): void {
    const currentWorkshop = this.currentWorkshops[this.currentWorkshopIndex]
    if (currentWorkshop && currentWorkshop.imageUrl && currentWorkshop.imageUrl.length > 0) {
      // Process images for viewing
      this.currentImages = currentWorkshop.imageUrl.map((url: string) => {
        // Convertir base64 o URL a formato visualizable
        if (url.startsWith("http")) {
          return url
        } else if (url.startsWith("data:image")) {
          return url
        } else if (url.startsWith("iVBOR") || url.startsWith("ASUN") || url.includes("/9j/") || url.includes("+/9k=")) {
          return `data:image/png;base64,${url}`
        } else {
          return "/assets/placeholder-image.png"
        }
      })

      this.currentImageIndex = 0

      // Use setTimeout to ensure the image viewer opens after the current execution context
      setTimeout(() => {
        this.showImageViewer = true
      }, 0)
    } else {
      Swal.fire({
        title: "Información",
        text: "Este taller no tiene imágenes",
        icon: "info",
        confirmButtonText: "Aceptar",
      })
    }
  }

  closeWorkshopViewer(): void {
    this.showWorkshopViewer = false
  }

  prevWorkshop(): void {
    if (this.currentWorkshopIndex > 0) {
      this.currentWorkshopIndex--
    }
  }

  nextWorkshop(): void {
    if (this.currentWorkshopIndex < this.currentWorkshops.length - 1) {
      this.currentWorkshopIndex++
    }
  }

  closeImageViewer(): void {
    this.showImageViewer = false
  }

  prevImage(): void {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--
    }
  }

  nextImage(): void {
    if (this.currentImageIndex < this.currentImages.length - 1) {
      this.currentImageIndex++
    }
  }

  // Método para formatear fechas en formato DD/MMM/YYYY
  formatDate(dateString: string | undefined): string {
    if (!dateString) return "Fecha no disponible"

    const date = new Date(dateString)
    const day = date.getDate() + 1
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
    const month = monthNames[date.getMonth()]
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }
  getSafeReport(report: ReportDto | ReportWithWorkshopsDto): ReportDto {
    return 'report' in report ? report.report : report;
  }

  getReportStatus(report: ReportDto | ReportWithWorkshopsDto): string {
    return 'report' in report ? report.report.status : report.status;
  }

  getWorkshopsCount(report: ReportDto | ReportWithWorkshopsDto): number {
    if ('workshops' in report && report.workshops) return report.workshops.length;
    if ('report' in report && (report as any).report.workshops)
      return (report as any).report.workshops.length;
    return 0;
  }

  hasWorkshops(report: ReportDto | ReportWithWorkshopsDto): boolean {
    return this.getWorkshopsCount(report) > 0;
  }


}

