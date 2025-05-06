package pe.edu.vallegrande.education.service;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;

public class EducationApiTest {

    @BeforeAll
    public static void setup() {
        RestAssured.baseURI = "https://super-happiness-5wq4gjgwpxpfppg4-8080.app.github.dev";
    }

    @Test
    public void testGetAllEducations() {
        given()
            .accept(ContentType.JSON)
        .when()
            .get("/education") 
        .then()
            .statusCode(200)
            .contentType(ContentType.JSON)
            .body("size()", greaterThanOrEqualTo(0));
    }

    @Test
    public void testCreateEducation() {
        String nuevaEducacionJson = """
        {
            "degreeStudy": "Primaria",
            "gradeBook": "A",
            "gradeAverage": 15,
            "fullNotebook": "NO",
            "assistance": "NO",
            "tutorials": "SI",
            "personId": 12
        }
        """;

        given()
            .contentType(ContentType.JSON)
            .body(nuevaEducacionJson)
        .when()
            .post("/education")
        .then()
            .statusCode(200)
            .body("degreeStudy", equalTo("Primaria"))
            .body("personId", equalTo(12));
    }
}
