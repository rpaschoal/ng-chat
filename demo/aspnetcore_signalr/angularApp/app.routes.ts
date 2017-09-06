import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/components/home/home.component';

const AppRoutes: Routes = [
    { path: '', component: HomeComponent }
];

export const AppRouting = RouterModule.forRoot(AppRoutes);
