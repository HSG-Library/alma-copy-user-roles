import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  AlertModule,
  CloudAppTranslateModule,
  MaterialModule,
} from '@exlibris/exl-cloudapp-angular-lib';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ConfigurationComponent } from './components/configuration/configuration.component';
import { FindUserComponent } from './components/find-user/find-user.component';
import { LoaderComponent } from './components/loader/loader.component';
import { MainComponent } from './components/main/main.component';
import { RoleSelectComponent } from './components/role-select/role-select.component';
import { ValidationDialog } from './components/validation-dialog/validation-dialog.component';
import { ResultComponent } from './components/result/result.component';
import { RoleOutputComponent } from './components/result/role-output.component';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    ConfigurationComponent,
    ValidationDialog,
    FindUserComponent,
    LoaderComponent,
    RoleSelectComponent,
    ResultComponent,
    RoleOutputComponent,
  ],
  entryComponents: [ValidationDialog, FindUserComponent, LoaderComponent],
  imports: [
    MaterialModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    AlertModule,
    FormsModule,
    ReactiveFormsModule,
    CloudAppTranslateModule.forRoot(),
  ],
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'standard' },
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
