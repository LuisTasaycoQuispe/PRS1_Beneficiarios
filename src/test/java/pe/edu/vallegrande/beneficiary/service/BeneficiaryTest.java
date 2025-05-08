package pe.edu.vallegrande.beneficiary.service;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;


import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;

public class BeneficiaryTest {
    @BeforeAll

    public static void setup() {
        RestAssured.baseURI = "http://localhost:8080";
    }

    @Test
    public void BeneficiaryGetTest() {
        given()
            .accept(ContentType.JSON)
        .when()
            .get("/api/persons/filter?typeKinship=Hijo&state=A") 
        .then()
            .statusCode(200)
            .contentType(ContentType.JSON)
            .body("size()", greaterThanOrEqualTo(0));
    }

    @Test
    public void BeneficiaryDeleteTest() {
        int beneficiaryId = 6;
        given()
            .contentType(ContentType.JSON)
        .when()
            .delete("/api/persons/" + beneficiaryId + "/delete")
        .then()
            .statusCode(200);
    }

    @Test
    public void BeneficiaryRestoreTest() {
        int beneficiaryId = 6;
        given()
            .contentType(ContentType.JSON)
        .when()
            .put("/api/persons/" + beneficiaryId + "/restore")
        .then()
            .statusCode(200);
    }

    @Test
    public void BeneficiaryUpdateTest() {
        int beneficiaryId = 6;
        String requestBody = "{\n" +
            "    \"idPerson\": " + beneficiaryId + ",\n" +
            "    \"name\": \"Laura Maria\",\n" +
            "    \"surname\": \"Ramírez\",\n" +
            "    \"age\": 22,\n" +
            "    \"birthdate\": \"2001-07-10\",\n" +
            "    \"typeDocument\": \"DNI\",\n" +
            "    \"documentNumber\": \"1232232\",\n" +
            "    \"typeKinship\": \"Hijo\",\n" +
            "    \"sponsored\": \"SI\",\n" +
            "    \"state\": \"A\",\n" +
            "    \"familyId\": 2\n" +
            "}";
        given()
            .contentType(ContentType.JSON)
            .body(requestBody)
        .when()
            .put("/api/persons/" + beneficiaryId + "/update-person")
        .then()
            .statusCode(200);
    }

    @Test
    public void BeneficiaryRegisterTest() {
        String requestBody = "{\n" +
            "    \"name\": \"Pablo\",\n" +
            "    \"surname\": \"Flores\",\n" +
            "    \"age\": 7,\n" +
            "    \"birthdate\": \"2018-12-12\",\n" +
            "    \"typeDocument\": \"DNI\",\n" +
            "    \"documentNumber\": \"12345678\",\n" +
            "    \"typeKinship\": \"Hijo\",\n" +
            "    \"sponsored\": \"SI\",\n" +
            "    \"state\": \"A\",\n" +
            "    \"familyId\": 2,\n" +
            "    \"education\": [],\n" +
            "    \"health\": []\n" +
            "}";
        given()
            .contentType(ContentType.JSON)
            .body(requestBody)
        .when()
            .post("/api/persons/register")
        .then()
            .statusCode(200);
    }
}
