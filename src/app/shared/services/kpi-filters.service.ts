import { 
    BehaviorSubject, 
    Observable,
    combineLatest
 } from "rxjs";
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root',
  })
export class KPIFiltersService {
    private criteriaSubject = new BehaviorSubject<boolean>(false);
    private fieldsSubject = new BehaviorSubject<boolean>(false);

    filterFormReady$(): Observable<boolean>{

       return  combineLatest(
            this.criteriaSubject.asObservable(), 
            this.fieldsSubject.asObservable(),
            (criteria, fields) => criteria && fields )
    }

    emitNewCriteriaValue(value: boolean){
        this.criteriaSubject.next(value);
    }
    
    emitNewFiltersValue(value: boolean){
        this.fieldsSubject.next(value);
    }

    resetFilterSubjects(){
        this.criteriaSubject.next(false);
        this.fieldsSubject.next(false);
    }
}