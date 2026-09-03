from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_current_user_optional, get_db
from app.models.project import Project
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectDetail, ProjectOut, SiteBrief

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get("/", response_model=list[ProjectOut])
def list_projects(
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    """Retrieve all projects with aggregated portfolio metrics."""
    projects = db.query(Project).order_by(Project.created_at.desc()).all()
    result = []
    for proj in projects:
        sites = proj.sites or []
        total_area = sum(s.area_hectares for s in sites)
        total_carbon = 0.0
        for s in sites:
            if s.metrics:
                latest = s.metrics[-1]
                total_carbon += latest.carbon_stock_tco2e

        p_out = ProjectOut(
            id=proj.id,
            user_id=proj.user_id,
            name=proj.name,
            description=proj.description,
            project_type=proj.project_type,
            target_carbon_tco2e=proj.target_carbon_tco2e,
            status=proj.status,
            country=proj.country,
            created_at=proj.created_at,
            site_count=len(sites),
            total_area_hectares=round(total_area, 2),
            current_carbon_stock_tco2e=round(total_carbon, 2),
        )
        result.append(p_out)
    return result


@router.post("/", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new carbon/biodiversity conservation project."""
    project = Project(
        user_id=current_user.id,
        name=project_in.name,
        description=project_in.description,
        project_type=project_in.project_type,
        target_carbon_tco2e=project_in.target_carbon_tco2e,
        status=project_in.status,
        country=project_in.country,
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    return ProjectOut(
        id=project.id,
        user_id=project.user_id,
        name=project.name,
        description=project.description,
        project_type=project.project_type,
        target_carbon_tco2e=project.target_carbon_tco2e,
        status=project.status,
        country=project.country,
        created_at=project.created_at,
        site_count=0,
        total_area_hectares=0.0,
        current_carbon_stock_tco2e=0.0,
    )


@router.get("/{project_id}", response_model=ProjectDetail)
def get_project_by_id(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    """Retrieve detailed information for a single project including its sites."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    sites = project.sites or []
    total_area = sum(s.area_hectares for s in sites)
    total_carbon = 0.0
    site_briefs = []

    for s in sites:
        if s.metrics:
            latest = s.metrics[-1]
            total_carbon += latest.carbon_stock_tco2e
        site_briefs.append(
            SiteBrief(
                id=s.id,
                name=s.name,
                area_hectares=s.area_hectares,
                centroid_lat=s.centroid_lat,
                centroid_lng=s.centroid_lng,
                habitat_type=s.habitat_type,
            )
        )

    return ProjectDetail(
        id=project.id,
        user_id=project.user_id,
        name=project.name,
        description=project.description,
        project_type=project.project_type,
        target_carbon_tco2e=project.target_carbon_tco2e,
        status=project.status,
        country=project.country,
        created_at=project.created_at,
        site_count=len(sites),
        total_area_hectares=round(total_area, 2),
        current_carbon_stock_tco2e=round(total_carbon, 2),
        sites=site_briefs,
    )


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a project and all associated sites and metrics."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    db.delete(project)
    db.commit()
    return None
