import { NgModule } from '@angular/core'
import { HttpClientModule } from '@angular/common/http'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MaterialModule, CloudAppTranslateModule, AlertModule } from '@exlibris/exl-cloudapp-angular-lib'

import { AppComponent } from './app.component'
import { AppRoutingModule } from './app-routing.module'
import { MainComponent } from './components/main/main.component'
import { ValidationDialog } from './components/validationDialog/validationDialog.component'
import { ConfigurationComponent } from './components/configuration/configuration.component'
import { FindUserComponent } from './components/findUser/findUser.component'
import { LoaderComponent } from './components/loader/loader.component'

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    ConfigurationComponent,
    ValidationDialog,
    FindUserComponent,
    LoaderComponent,
  ],
  entryComponents: [
    ValidationDialog,
    FindUserComponent,
    LoaderComponent,
  ],
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
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'standard' } }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
