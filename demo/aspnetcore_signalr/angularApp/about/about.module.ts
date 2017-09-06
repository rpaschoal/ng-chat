import { AboutComponent } from './components/about/about.component';
import { AboutRoutes } from './about.routes';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
    imports: [
        CommonModule,
        AboutRoutes
    ],

    declarations: [
        AboutComponent
    ],

    exports: [
        AboutComponent
    ]
})

export class AboutModule { }
