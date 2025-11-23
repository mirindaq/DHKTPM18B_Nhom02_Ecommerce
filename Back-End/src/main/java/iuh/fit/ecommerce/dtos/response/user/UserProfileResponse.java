package iuh.fit.ecommerce.dtos.response.user;

import iuh.fit.ecommerce.dtos.response.rank.RankResponse;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class UserProfileResponse {
    private Long id;
    private String email;
    private String fullName;
    private List<String> roles;
    private String avatar;
    private String phone;
    private RankResponse rank;
    private Boolean leader;
}
