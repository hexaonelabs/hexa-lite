import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MarketPoolGroupItemComponent } from './market-pool-group-item.component';

describe('MarketPoolGroupItemComponent', () => {
  let component: MarketPoolGroupItemComponent;
  let fixture: ComponentFixture<MarketPoolGroupItemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MarketPoolGroupItemComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MarketPoolGroupItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
