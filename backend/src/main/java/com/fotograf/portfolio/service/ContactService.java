package com.fotograf.portfolio.service;

import com.fotograf.portfolio.domain.ContactMessage;
import com.fotograf.portfolio.dto.ContactMessageDto;
import com.fotograf.portfolio.dto.ContactMessageRequest;
import com.fotograf.portfolio.exception.NotFoundException;
import com.fotograf.portfolio.repository.ContactMessageRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ContactService {

    private final ContactMessageRepository repository;
    private final DtoMapper mapper;

    public ContactService(ContactMessageRepository repository, DtoMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Transactional
    public void submit(ContactMessageRequest req) {
        ContactMessage m = new ContactMessage();
        m.setName(req.name().trim());
        m.setEmail(req.email().trim());
        m.setMessage(req.message().trim());
        repository.save(m);
    }

    @Transactional(readOnly = true)
    public List<ContactMessageDto> listAll() {
        return repository.findAllByOrderByCreatedAtDesc().stream()
                .map(mapper::toContactMessageDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public long unreadCount() {
        return repository.countByReadFalse();
    }

    @Transactional
    public ContactMessageDto markRead(Long id) {
        ContactMessage m = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Poruka nije pronadjena: " + id));
        m.setRead(true);
        return mapper.toContactMessageDto(repository.save(m));
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new NotFoundException("Poruka nije pronadjena: " + id);
        }
        repository.deleteById(id);
    }
}
