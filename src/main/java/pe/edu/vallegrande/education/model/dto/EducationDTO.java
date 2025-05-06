package pe.edu.vallegrande.education.model.dto;

import lombok.Data;

@Data
public class EducationDTO {

    private Integer idEducation;
    private String degreeStudy;
    private String gradeBook;
    private int gradeAverage;
    private String fullNotebook;
    private String assistance;
    private String tutorials;
    private Integer personId;
}
