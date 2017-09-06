import { HomeComponent } from './components/home/home.component';
import { HomeRoutes } from './home.routes';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        HttpModule,
        HomeRoutes
    ],

    declarations: [
        HomeComponent
    ],

    exports: [
        HomeComponent
    ]
})

export class HomeModule { }