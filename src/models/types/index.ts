export interface UserData {
  telegramId: number;
  firstName?: string;
  lastName?: string;
  username?: string;
  fullName: string;
  city?: string;
  restaurant?: string;
  isAdmin: boolean;
  isApproved: boolean;
  temp: Record<string, unknown>;
  lastGreetingDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActInput {
  weightEtiketka: number;
  slicesSushi: number;
  redTrim: number;
  blackTrim: number;
}

export interface ActData extends ActInput {
  actNumber: number;
  telegramId: number;
  city: string;
  restaurant: string;
  fishType: string;
  waste: number;
  calculatedWaste: number;
  division: string;
  timestamp: Date;
}

export interface Metric {
  value: number;
  norm: number;
  type: 'min' | 'max';
  isWithinNorm: boolean;
  deviation?: number;
}

export interface ActMetrics {
  waste: number;
  metrics: {
    slicesSushi: Metric;
    redTrim: Metric;
    blackTrim: Metric;
    waste: Metric;
  };
  isWithinNorms: boolean;
  deviations: string[];
}

export type BotState =
  | 'main'
  | 'registration_city_select'
  | 'registration_restaurant_select'
  | 'filling_act_fish_select'
  | 'filling_act_input_weight_etiketka'
  | 'filling_act_input_slices_sushi'
  | 'filling_act_input_red_trim'
  | 'filling_act_input_black_trim'
  | 'filling_act_results'
  | 'admin_employees_main'
  | 'admin_fish_main'
  | 'admin_viewing_user_actions';

export type UserRole = 'admin' | 'employee' | 'candidate';
