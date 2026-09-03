import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Float, ForeignKey, String, Text
from sqlalchemy.orm import relationship
from app.db.base import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    project_type = Column(
        String(100),
        default="Reforestation",
        nullable=False,
        comment="Reforestation, Blue Carbon (Mangroves), Agroforestry, Peatland, Grassland",
    )
    target_carbon_tco2e = Column(Float, default=10000.0, nullable=False)
    status = Column(String(50), default="Active", nullable=False)
    country = Column(String(100), default="India", nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    owner = relationship("User", back_populates="projects")
    sites = relationship("Site", back_populates="project", cascade="all, delete-orphan")
