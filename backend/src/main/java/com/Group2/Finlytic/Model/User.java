package com.Group2.Finlytic.Model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = true)
    private String phoneNumber;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role;

    @Column(nullable = true)
    private String profilePhoto;

    @Column(nullable = true)
    private String provider;

    private boolean enabled = true;

    @Column(nullable = false)
    private boolean emailVerified = false;

    public Long getUserId() {
        return this.id;
    }

    public boolean getEnabled() {
        return this.enabled;
    }
}