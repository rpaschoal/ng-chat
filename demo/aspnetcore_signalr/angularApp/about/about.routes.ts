import { CanLoadGuard } from './../shared/guards/canLoadGuard';
import { CanDeactivateGuard } from './../shared/guards/canDeactivateGuard';
import { AuthenticationGuard } from './../shared/guards/authenticationGuard';
import { AboutComponent } from './components/about/about.component';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    {
        path: 'about',
        component: AboutComponent,
        canActivate: [AuthenticationGuard],
        canDeactivate: [CanDeactivateGuard],
        canLoad: [CanLoadGuard]
    }
];

export const AboutRoutes = RouterModule.forChild(routes);
