"""
ZODB Persistent Objects
"""

import persistent


class MentalSphereObject(persistent.Persistent):
    def __init__(self, id, name, detail, color, image, rec_status,
                 created_by, spatial_data_id, created_at):
        self.id = id
        self.name = name
        self.detail = detail
        self.color = color
        self.image = image
        self.rec_status = rec_status
        self.spatial_data_id = spatial_data_id
        self.created_by = created_by
        self.created_at = created_at
        self.updated_at = created_at

    def get_id(self): return self.id
    def get_name(self): return self.name
    def get_detail(self): return self.detail
    def get_image(self): return self.image
    def get_color(self): return self.color
    def get_rec_status(self): return self.rec_status
    def get_created_by(self): return self.created_by
    def get_created_by_id(self): return self.created_by
    def get_spatial_data_id(self): return self.spatial_data_id
    def get_created_at(self): return self.created_at
    def get_updated_at(self): return self.updated_at

    def set_name(self, name): self.name = name
    def set_detail(self, detail): self.detail = detail
    def set_image(self, image): self.image = image
    def set_color(self, color): self.color = color
    def set_rec_status(self, rec_status): self.rec_status = rec_status
    def set_created_by(self, created_by): self.created_by = created_by
    def set_spatial_data_id(self, spatial_data_id): self.spatial_data_id = spatial_data_id
    def set_created_at(self, created_at): self.created_at = created_at
    def set_updated_at(self, updated_at): self.updated_at = updated_at


class MindObject(persistent.Persistent):
    def __init__(self, id, name, detail, color, rec_status,
                 spatial_data_id, created_by, mental_sphere_ids, created_at):
        self.id = id
        self.name = name
        self.detail = detail
        self.color = color
        self.rec_status = rec_status
        self.spatial_data_id = spatial_data_id
        self.created_by = created_by
        self.mental_sphere_ids = mental_sphere_ids if mental_sphere_ids else []
        self.created_at = created_at
        self.updated_at = created_at

    def get_id(self): return self.id
    def get_name(self): return self.name
    def get_detail(self): return self.detail
    def get_color(self): return self.color
    def get_rec_status(self): return self.rec_status
    def get_created_by(self): return self.created_by
    def get_mental_sphere_ids(self): return self.mental_sphere_ids
    def get_created_at(self): return self.created_at
    def get_updated_at(self): return self.updated_at
    def get_spatial_data_id(self): return self.spatial_data_id

    def set_name(self, name): self.name = name
    def set_detail(self, detail): self.detail = detail
    def set_color(self, color): self.color = color
    def set_rec_status(self, rec_status): self.rec_status = rec_status
    def set_created_by(self, created_by): self.created_by = created_by
    def set_created_at(self, created_at): self.created_at = created_at
    def set_updated_at(self, updated_at): self.updated_at = updated_at
    def set_spatial_data_id(self, spatial_data_id): self.spatial_data_id = spatial_data_id

    def add_mental_sphere(self, sphere_id):
        if sphere_id not in self.mental_sphere_ids:
            self.mental_sphere_ids.append(sphere_id)

    def remove_mental_sphere(self, sphere_id):
        if sphere_id in self.mental_sphere_ids:
            self.mental_sphere_ids.remove(sphere_id)
