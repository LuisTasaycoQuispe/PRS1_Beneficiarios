// 🔹 Interfaz base que representa directamente el modelo del backend
export interface Workshop {
    id: number;
    name: string;
    description: string;
    dateStart: Date;
    dateEnd: Date;
    active: boolean;
}

// 🔹 Datos que se envían al crear o actualizar (sin ID)
export interface WorkshopRequestDto {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    state?: string;
}

// 🔹 Datos que se reciben al obtener un taller (igual al modelo base)
export interface WorkshopResponseDto {
    id: number;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    state: string;
}
