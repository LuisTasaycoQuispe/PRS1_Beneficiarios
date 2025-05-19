package pe.edu.vallegrande.beneficiary;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import pe.edu.vallegrande.beneficiary.controller.PersonController;
import pe.edu.vallegrande.beneficiary.dto.PersonDTO;
import pe.edu.vallegrande.beneficiary.service.PersonService;
import reactor.test.StepVerifier;

import static org.mockito.Mockito.*;

public class PersonControllerTest {

    @Mock
    private PersonService personService;

    @InjectMocks
    private PersonController personController;

    private PersonDTO personDTO;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        personDTO = new PersonDTO();
        personDTO.setAge(1);
        personDTO.setName("Luis");
        personDTO.setState("Activo");
    }

    @Test
    void testGetPersonsByTypeKinshipAndState() {
        when(personService.getPersonsByTypeKinshipAndState("Hijo", "A"))
                .thenReturn(reactor.core.publisher.Flux.just(personDTO));

        StepVerifier.create(personController.getPersonsByTypeKinshipAndState("Hijo", "A"))
                .expectNext(personDTO)
                .verifyComplete();

        verify(personService).getPersonsByTypeKinshipAndState("Hijo", "A");
    }

    @Test
    void testGetPersonByIdWithDetails() {
        when(personService.getPersonByIdWithDetails(1)).thenReturn(reactor.core.publisher.Mono.just(personDTO));

        StepVerifier.create(personController.getPersonByIdWithDetails(1))
                .expectNext(personDTO)
                .verifyComplete();

        verify(personService).getPersonByIdWithDetails(1);
    }

    @Test
    void testDeletePerson() {
        when(personService.deletePerson(1)).thenReturn(reactor.core.publisher.Mono.empty());

        StepVerifier.create(personController.deletePerson(1))
                .verifyComplete();

        verify(personService).deletePerson(1);
    }

    @Test
    void testRegisterPerson() {
        when(personService.registerPerson(personDTO)).thenReturn(reactor.core.publisher.Mono.empty());

        StepVerifier.create(personController.registerPerson(personDTO))
                .verifyComplete();

        verify(personService).registerPerson(personDTO);
    }
}
