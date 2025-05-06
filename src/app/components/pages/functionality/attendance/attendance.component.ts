import { Component, inject,  OnInit } from "@angular/core"
import  { Attendance } from "../../../../interfaces/attendance"
import { AttendanceService } from "../../../../services/attendance.service"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import  { IssueService } from "./../../../../services/issue.service"
import  { WorkshopService } from "../../../../services/workshop.service"
import  { PersonaService } from "../../../../services/person.service"
import { forkJoin } from "rxjs"
import { AttendanceModalComponent } from "./attendance-modal/attendance-modal.component"

@Component({
  selector: "app-attendance",
  standalone: true,
  imports: [CommonModule, FormsModule, AttendanceModalComponent],
  templateUrl: "./attendance.component.html",
  styleUrl: "./attendance.component.css",
})
export class AttendanceComponent implements OnInit {
  private attendanceService = inject(AttendanceService)
  isModalOpen = false
  isEditMode = false
  attendanceList: Attendance[] = []
  attendance: Attendance[] = []
  filteredAttendance: Attendance[] = []
  isLoadingAttendance = true
  currentDateTime = ""
  issueList: any[] = []
  workshops: any[] = []
  personList: any[] = []
  previewImage: string | null = null // Para mostrar la vista previa de la imagen
  imageFile: File | null = null
  selectedPerson: any = null
  editAttendance: Attendance | null = null
  filteredIssues: any[] = [] // Temas filtrados según el taller seleccionado
  selectedWorkshopId = 0 // ID del taller seleccionado
  selectedIssueId = 0
  attendanceForm: Attendance = {
    id: 0,
    issueId: 0,
    personId: 0,
    entryTime: "",
    justificationDocument: "",
    record: "",
    state: "",
  }

  constructor(
    private issueService: IssueService,
    private personService: PersonaService,
    private workshopService: WorkshopService,
  ) {}

  ngOnInit(): void {
    this.getAttendances()
    this.getIssues()
    this.getPersons()
    this.loadData()
    this.setCurrentDateTime()
  }

  getAttendances(): void {
    this.isLoadingAttendance = true
    forkJoin({
      persons: this.personService.getPersons(),
      issues: this.issueService.getActiveIssues(),
      attendances: this.attendanceService.getAttendances(),
      workshops: this.workshopService.getActiveWorkshops(),
    }).subscribe(
      ({ persons, issues, attendances, workshops }) => {
        this.workshops = workshops // Asignar talleres a la propiedad
        this.issueList = issues // Asignar temas a la propiedad
        this.attendance = attendances.map((att: any) => {
          const issue = issues.find((t) => t.id === att.issueId)
          const person = persons.find((p) => p.id === att.personId)
          const workshop = workshops.find((w) => w.id === issue?.workshopId)

          return {
            ...att,
            issueName: issue ? issue.name : "No asignado",
            workshopName: workshop ? workshop.name : "No asignado",
            personName: person ? person.name : "No encontrado",
          }
        })

        this.filteredAttendance = [...this.attendance] // Inicialmente, mostrar todas las asistencias
        this.filteredIssues = [...this.issueList] // Inicialmente, mostrar todos los temas
        console.log("Workshops:", this.workshops) // Verifica que los talleres se estén cargando
        console.log("Issues:", this.issueList) // Verifica que los issues se estén cargando
        console.log("Attendances:", this.attendance) // Verifica que las asistencias se estén cargando
        this.isLoadingAttendance = false
      },
      (error) => {
        console.error("Error retrieving attendance data:", error)
        this.isLoadingAttendance = false
      },
    )
  }

  getIssues(): void {
    this.issueService.getActiveIssues().subscribe({
      next: (data) => {
        console.log("Loaded Issues:", data) // Verificar la carga de issues
        this.issueList = data
        this.filteredIssues = [...this.issueList] // Inicialmente, mostrar todos los temas
      },
      error: (err) => {
        console.error("Error fetching issues:", err)
      },
    })
  }

  getPersons(): void {
    this.personService.getPersons().subscribe(
      (response) => {
        this.personList = response
      },
      (error) => {
        console.error("Error retrieving persons:", error)
      },
    )
  }

  loadData(): void {
    forkJoin({
      persons: this.personService.getPersons(),
      issues: this.issueService.getActiveIssues(),
      attendances: this.attendanceService.getAttendances(),
    }).subscribe(
      ({ persons, issues, attendances }) => {
        this.personList = persons
        this.issueList = issues

        this.attendanceList = attendances.map((att: any) => {
          const issue = this.issueList.find((t) => t.id === att.issueId)
          const person = this.personList.find((p) => p.idPerson === att.personId)
          return {
            ...att,
            issueName: issue ? issue.name : "No asignado",
            personName: person ? person.name : "⚠️ No encontrado",
          }
        })
      },
      (error) => {
        console.error("Error cargando datos:", error)
      },
    )
  }

  openModal(): void {
    this.isEditMode = false
    this.attendanceForm = {
      id: 0,
      issueId: 0,
      personId: 0,
      entryTime: this.getCurrentDateTime(), // ✅ Se asigna con el formato correcto
      record: "A",
      justificationDocument: "",
      state: "A",
    }
    this.isModalOpen = true
  }

  closeModal(): void {
    this.isModalOpen = false
  }

  setCurrentDateTime(): void {
    const now = new Date()
    const formattedDate = now.toISOString().slice(0, 16) // ✅ Formato correcto `YYYY-MM-DDTHH:mm`
    this.currentDateTime = formattedDate
  }

  getCurrentDateTime(): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0") // Asegurar dos dígitos
    const day = String(now.getDate()).padStart(2, "0")
    const hours = String(now.getHours()).padStart(2, "0")
    const minutes = String(now.getMinutes()).padStart(2, "0")

    return `${year}-${month}-${day}T${hours}:${minutes}:00` // ✅ Incluye los segundos ":00"
  }

  openEditModal(attendance: Attendance): void {
    this.isEditMode = true
    this.attendanceForm = { ...attendance } // Cargar la asistencia en el formulario
    this.isModalOpen = true
  }

  openEditModalForAttendance(issueId: number, personId: number): void {
    // Limpiar la vista previa y la imagen cargada antes de abrir el modal
    this.previewImage = null // Limpiar la vista previa
    this.imageFile = null // Limpiar el archivo de imagen

    // Buscar si existe un registro de asistencia para el tema y persona
    const attendanceRecord = this.attendance.find((att) => att.issueId === issueId && att.personId === personId)

    // Si el registro ya existe, se abre en modo edición
    if (attendanceRecord) {
      // Solo permitir edición si el estado es 'F' (falta) o 'T' (tarde)
      if (attendanceRecord.record === "F" || attendanceRecord.record === "T") {
        this.isEditMode = true // Establecemos el modo de edición
        this.attendanceForm = { ...attendanceRecord } // Cargamos los datos del registro en el formulario

        // Si hay un archivo de justificación, mostramos la vista previa
        if (attendanceRecord.justificationDocument && attendanceRecord.justificationDocument !== "N/A") {
          this.previewImage = `path_to_images_folder/${attendanceRecord.justificationDocument}` // Asumiendo que la imagen está en un folder accesible
        }

        this.isModalOpen = true // Abrimos el modal para editar
      } else {
        // Si el estado no es 'F' ni 'T', no permitimos la edición
        alert('No se puede editar esta asistencia, el record es "A" o "J"')
        return
      }
    } else {
      // Si no existe el registro, se crea uno nuevo
      this.isEditMode = false // Establecemos el modo de creación
      this.attendanceForm = {
        id: 0, // El ID será 0, ya que el backend lo asignará cuando se guarde.
        issueId,
        personId,
        entryTime: this.getCurrentDateTime(),
        record: "A", // Cambiado a 'A' por defecto
        justificationDocument: "",
        state: "A", // Estado por defecto, Activo
      }
      this.isModalOpen = true // Abrimos el modal para agregar un nuevo registro
    }
  }

  getAttendanceStatus(issueId: number, personId: number): string {
    const attendanceRecord = this.attendance.find((att) => att.issueId === issueId && att.personId === personId)

    if (attendanceRecord) {
      return attendanceRecord.record // Devuelve el estado (A, F, T, J)
    }

    return "none" // Si no hay registro, retorna 'none' para mostrar '-'
  }

  getIssueScheduledTime(issueId: number): string | null {
    const issue = this.issueList.find((t) => t.id === issueId)
    return issue ? issue.scheduledTime : null
  }

  filterAttendance(): void {
    if (this.filteredIssues.length === 0) {
      console.log("No issues found for the selected workshop.")
    }

    // Filtrar las asistencias basadas en los issues filtrados
    this.filteredAttendance = this.attendance.filter((attendance) => {
      return this.filteredIssues.some((issue) => issue.id === attendance.issueId)
    })

    console.log("Filtered Attendance:", this.filteredAttendance) // Verifica las asistencias filtradas
  }

  filterIssuesByWorkshop(): void {
    console.log("Selected Workshop ID:", this.selectedWorkshopId)

    const selectedWorkshopIdNumber = Number(this.selectedWorkshopId) // Aseguramos que sea un número
    if (selectedWorkshopIdNumber === 0) {
      this.filteredIssues = [...this.issueList] // Si no se selecciona ningún workshop, mostramos todos los issues
    } else {
      this.filteredIssues = this.issueList.filter((issue) => issue.workshopId === selectedWorkshopIdNumber)
    }

    console.log("Filtered Issues:", this.filteredIssues)
    this.filterAttendance() // Llamar al filtro de asistencia después de filtrar los temas
  }

  onModalClosed(): void {
    this.isModalOpen = false
    // Recargar los datos después de cerrar el modal
    this.getAttendances()
  }

  onAttendanceSaved(attendance: Attendance): void {
    console.log("Asistencia guardada:", attendance)
    // Recargar los datos después de guardar
    this.getAttendances()
    this.isModalOpen = false
  }
}
