import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { Family } from '../../../../../interfaces/familiaDto';
import { FamilyService } from '../../../../../services/family.service';
import { PersonaService } from '../../../../../services/person.service';

@Component({
  selector: 'app-formulariofamilia',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './formulariofamilia.component.html',
  styleUrls: ['./formulariofamilia.component.css'],
})
export class FormulariofamiliaComponent {
  @Input() familyToEdit: Family | null = null;
  @Output() familyCreated = new EventEmitter<Family>();
  @Output() formClosed = new EventEmitter<void>();

  family: Family = this.initializeFamily();
  familyId: number | null = null;
  currentSection = 0;

  // Nombres para las secciones del menu

  sections = [
    { title: 'Informa. Familiar', icon: '👨‍👩‍👧‍👦' },
    { title: 'Entorno Comunitar.', icon: '🏘️' },
    { title: 'Composi. Familiar', icon: '👥' },
    { title: 'Salud Familiar', icon: '🏥' },
    { title: 'Distrib. Vivienda', icon: '🏠' },
    { title: 'Autonomía Laboral', icon: '💼' },
    { title: 'Vida Social', icon: '🤝' },
  ];

  constructor(
    private familyService: FamilyService,
    private personaService: PersonaService // Añadido PersonaService
  ) {}

  ngOnChanges() {
    if (this.familyToEdit) {
      this.family = { ...this.familyToEdit };
      this.familyId = this.family.id;
    } else {
      this.family = this.initializeFamily();
      this.familyId = null;
    }
  }

  nextSection() {
    if (this.currentSection < this.sections.length - 1) {
      this.currentSection++;
    }
  }

  previousSection() {
    if (this.currentSection > 0) {
      this.currentSection--;
    }
  }



  // Metodo para crear y mandar datos (Crear e Actualizar)

  initializeFamily(): Family {
    return {
      id: 0,
      lastName: '',
      direction: '',
      reasibAdmission: '',
      numberMembers: 0,
      numberChildren: 0,
      familyType: '',
      socialProblems: '',
      weeklyFrequency: '',
      feedingType: '',
      safeType: '',
      familyDisease: '',
      treatment: '',
      diseaseHistory: '',
      medicalExam: '',
      tenure: '',
      typeOfHousing: '',
      housingMaterial: '',
      housingSecurity: '',
      homeEnvironment: 0,
      bedroomNumber: 0,
      habitability: '',
      numberRooms: 0,
      numberOfBedrooms: 0,
      habitabilityBuilding: '',
      status: 'A',
      basicService: {
        waterService: '',
        servDrain: '',
        servLight: '',
        servCable: '',
        servGas: '',
        area: '',
        referenceLocation: '',
        residue: '',
        publicLighting: '',
        security: '',
        material: '',
        feeding: '',
        economic: '',
        spiritual: '',
        socialCompany: '',
        guideTip: '',
      },
    };
  }

  onSubmit(form: any) {
    if (form.valid) {
      if (this.familyId) {
        // Existing update logic...
        this.familyService.updateFamily(this.familyId, this.family).subscribe(
          (response) => {
            console.log('Familia editada:', response);
            this.familyCreated.emit(response);
            Swal.fire({
              title: 'Éxito!',
              text: 'Registro editado exitosamente!',
              icon: 'success',
              confirmButtonText: 'Aceptar',
            }).then(() => {
              this.resetForm();
              this.closeForm();
            });
          },
          (error) => {
            console.error('Error al editar la familia:', error);
            Swal.fire({
              title: 'Error!',
              text: 'Ocurrió un error al editar el registro.',
              icon: 'error',
              confirmButtonText: 'Aceptar',
            });
          }
        );
      } else {
        // Create new family
        this.familyService.createFamily(this.family).subscribe({
          next: (response) => {
            console.log('Familia creada:', response);
            this.assignPersonsToFamily(response.id);
          },
          error: (error) => {
            console.error('Error al crear la familia:', error);
            Swal.fire({
              title: 'Error!',
              text: 'Ocurrió un error al crear el registro.',
              icon: 'error',
              confirmButtonText: 'Aceptar',
            });
          },
        });
      }
    } else {
      console.log('Formulario no válido');
    }
  }

  private assignPersonsToFamily(familyId: number) {
    this.personaService.assignFamilyToPersons(familyId).subscribe({
      next: (updatedPersons) => {
        console.log('Personas actualizadas con familia:', updatedPersons);
        this.familyCreated.emit(this.family);
        Swal.fire({
          title: 'Éxito!',
          text: 'Registro creado y personas asignadas exitosamente!',
          icon: 'success',
          confirmButtonText: 'Aceptar',
        }).then(() => {
          this.resetForm();
          this.closeForm();
        });
      },
      error: (error) => {
        console.error('Error al asignar personas a la familia:', error);
        Swal.fire({
          title: 'Éxito parcial',
          text: 'Familia creada pero hubo un error al asignar personas.',
          icon: 'warning',
          confirmButtonText: 'Aceptar',
        }).then(() => {
          this.resetForm();
          this.closeForm();
        });
      },
    });
  }



  // Metodo de reseteo y cierre de formulario

  resetForm() {
    this.family = this.initializeFamily();
    this.familyId = null;
  }

  closeForm() {
    this.resetForm();
    this.formClosed.emit();
  }

}
