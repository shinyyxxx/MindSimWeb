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


class ExperienceObject(persistent.Persistent):
    """Represents a cognitive experience processed through Abhidhamma stages"""
    def __init__(self, id, mind_id, sense_door, object_experienced, feeling_potential,
                 mental_context, non_kammic_stage, javana_result, created_at):
        self.id = id
        self.mind_id = mind_id
        self.sense_door = sense_door
        self.object_experienced = object_experienced
        self.feeling_potential = feeling_potential
        self.mental_context = mental_context  # dict
        self.non_kammic_stage = non_kammic_stage  # dict
        self.javana_result = javana_result  # dict
        self.created_at = created_at
    
    def get_id(self): return self.id
    def get_mind_id(self): return self.mind_id
    def get_sense_door(self): return self.sense_door
    def get_object_experienced(self): return self.object_experienced
    def get_feeling_potential(self): return self.feeling_potential
    def get_mental_context(self): return self.mental_context
    def get_non_kammic_stage(self): return self.non_kammic_stage
    def get_javana_result(self): return self.javana_result
    def get_created_at(self): return self.created_at
    
    def get_kamma_produced(self):
        """Quick accessor for kamma result"""
        return self.javana_result.get('kamma_produced')
