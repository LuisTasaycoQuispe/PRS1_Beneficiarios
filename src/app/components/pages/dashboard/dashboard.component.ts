import { ThemeService } from '../../../services/ui/theme.service';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  darkMode$ = this.themeService.darkMode$;

  // Datos para las tarjetas del dashboard
  dashboardCards = [
    {
      title: 'Asistencias',
      count: 17,
      icon: 'calendar-check',
      route: '/modulo-asistencias/dashboard',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      title: 'Reportes',
      count: 5,
      icon: 'file-text',
      route: '/modulo-reportes/dashboard',
      color: 'from-emerald-500 to-teal-600'
    },
    {
      title: 'Personas',
      count: 13,
      icon: 'users',
      route: '/modulo-personas/dashboard',
      color: 'from-purple-500 to-violet-600'
    },
    {
      title: 'Familia',
      count: 8,
      icon: 'home',
      route: '/modulo-familia/dashboard',
      color: 'from-amber-500 to-orange-600'
    }
  ];

  constructor(private themeService: ThemeService) { }
}