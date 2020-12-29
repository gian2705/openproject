import {EditFieldHandler} from "core-app/modules/fields/edit/editing-portal/edit-field-handler";
import {ElementRef, Injector, Injectable} from "@angular/core";
import {IFieldSchema} from "core-app/modules/fields/field.base";
import {BehaviorSubject} from "rxjs";
import {GridWidgetResource} from "core-app/modules/hal/resources/grid-widget-resource";
import {UploadFile} from "core-components/api/op-file-upload/op-file-upload.service";
import {HalResourceService} from "core-app/modules/hal/services/hal-resource.service";
import {ResourceChangeset} from "core-app/modules/fields/changeset/resource-changeset";
import {SchemaCacheService} from "core-components/schemas/schema-cache.service";
import {SchemaResource} from "core-app/modules/hal/resources/schema-resource";

@Injectable()
export class CustomTextEditFieldService extends EditFieldHandler {
  public fieldName = 'text';
  public inEdit = false;
  public inEditMode = false;
  public inFlight = false;

  public valueChanged$:BehaviorSubject<string>;

  public changeset:ResourceChangeset;

  constructor(protected elementRef:ElementRef,
              protected injector:Injector,
              protected halResource:HalResourceService,
              protected schemaCache:SchemaCacheService) {
    super();
  }

  errorMessageOnLabel:string;

  onFocusOut():void {
    // interface
  }

  public initialize(value:GridWidgetResource) {
    this.initializeChangeset(value);
    this.valueChanged$ = new BehaviorSubject(value.options['text'] as string);
  }

  public reinitialize(value:GridWidgetResource) {
    this.initializeChangeset(value);
  }

  /**
   * Handle saving the text
   */
  public handleUserSubmit():Promise<any> {
    return this.update();
  }

  public reset(withText:string = '') {
    if (withText.length > 0) {
      withText += '\n';
    }

    this.changeset.setValue(this.fieldName, { raw: withText });
  }

  public get schema():IFieldSchema {
    return {
      name: I18n.t('js.grid.widgets.custom_text.title'),
      writable: true,
      required: false,
      type: 'Formattable',
      hasDefault: false
    };
  }

  private async update() {
    return this
      .onSubmit()
      .then(() => {
        this.valueChanged$.next(this.rawText);
        this.deactivate();
      });
  }

  public get rawText() {
    return _.get(this.textValue, 'raw', '');
  }

  public get htmlText() {
    return _.get(this.textValue, 'html', '');
  }

  public get textValue() {
    return this.changeset.value(this.fieldName);
  }

  public handleUserCancel() {
    this.deactivate();
  }

  public get active() {
    return this.inEdit;
  }

  public activate(withText?:string) {
    this.inEdit = true;
  }

  deactivate():void {
    this.changeset.clear();
    this.inEdit = false;
  }

  focus():void {
    const trigger = this.elementRef.nativeElement.querySelector('.inplace-editing--trigger-container');
    trigger && trigger.focus();
  }

  setErrors(newErrors:string[]):void {
    // interface
  }

  handleUserKeydown(event:JQuery.TriggeredEvent, onlyCancel?:boolean):void {
    // interface
  }

  isChanged():boolean {
    return !this.changeset.isEmpty();
  }

  stopPropagation(evt:JQuery.TriggeredEvent):boolean {
    return false;
  }

  /**
   * Mimiks having a HalResource for the sake of the Changeset.
   * @param value
   */
  private initializeChangeset(value:GridWidgetResource) {
    let schemaHref = 'customtext-schema';
    let resourceSource = {
                           text: value.options.text,
                           getEditorTypeFor: () => 'full',
                           canAddAttachments: value.grid.canAddAttachments,
                           uploadAttachments: (files:UploadFile[]) => value.grid.uploadAttachments(files),
                           _links: {
                             schema: {
                               href: schemaHref
                             }
                           }
                         };

    let resource = this.halResource.createHalResource(resourceSource, true);

    let schemaSource = {
      text: this.schema,
      _links: {
        self: { href: schemaHref }
      }
    };

    let schema = this.halResource.createHalResource(schemaSource, true) as SchemaResource;

    this.schemaCache.update(resource, schema);

    this.changeset = new ResourceChangeset(resource);
  }
}
