import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TeamMember, InviteUserRequest } from '../models/team.model';

@Injectable({ providedIn: 'root' })
export class TeamService {
  private base = (cId: string) =>
    `${environment.apiUrl}/commerces/${cId}/team`;

  constructor(private http: HttpClient) {}

  invite(commerceId: string, req: InviteUserRequest): Observable<TeamMember> {
    return this.http.post<TeamMember>(
      `${this.base(commerceId)}/invite`, req);
  }

  getTeam(commerceId: string): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(this.base(commerceId));
  }

  remove(commerceId: string, targetUserId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.base(commerceId)}/${targetUserId}`);
  }

  assignBranch(commerceId: string, targetUserId: string,
               branchId: string): Observable<TeamMember> {
    return this.http.post<TeamMember>(
      `${this.base(commerceId)}/${targetUserId}/branches/${branchId}`, {});
  }

  unassignBranch(commerceId: string, targetUserId: string,
                 branchId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.base(commerceId)}/${targetUserId}/branches/${branchId}`);
  }
}